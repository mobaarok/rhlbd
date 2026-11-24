<?php

namespace App\Models;

use App\Enums\ListingType;
use App\Enums\PricePeriod;
use App\Enums\PropertyStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * A property listing (apartment, office, building...) for rent or sale.
 *
 * @property int $id
 * @property int|null $user_id
 * @property int $category_id
 * @property int $area_id
 * @property string $title
 * @property string $slug
 * @property string|null $code
 * @property ListingType $listing_type
 * @property PropertyStatus $status
 * @property bool $is_featured
 * @property string|null $rejection_reason
 * @property int $price
 * @property PricePeriod $price_period
 * @property int $bedrooms
 * @property int $bathrooms
 * @property int $parking
 * @property int|null $floor
 * @property int $size_sqft
 * @property string|null $building_name
 * @property string $address
 * @property string|null $map_embed_url
 * @property string $description
 * @property array<int, array{name: string, distance: string}>|null $nearby
 * @property string|null $contact_name
 * @property string|null $contact_phone
 * @property int $views
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable([
    'category_id', 'area_id', 'title', 'slug', 'code', 'listing_type', 'status',
    'is_featured', 'price', 'price_period', 'bedrooms', 'bathrooms', 'parking',
    'floor', 'size_sqft', 'building_name', 'address', 'map_embed_url',
    'description', 'nearby', 'contact_name', 'contact_phone',
])]
class Property extends Model
{
    /**
     * Allowed values for the "sort" search parameter.
     */
    public const SORT_OPTIONS = ['newest', 'price_asc', 'price_desc', 'size_desc'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'listing_type' => ListingType::class,
            'status' => PropertyStatus::class,
            'price_period' => PricePeriod::class,
            'is_featured' => 'boolean',
            'nearby' => 'array',
        ];
    }

    /**
     * Generate a unique slug from the title when none is given.
     */
    protected static function booted(): void
    {
        static::creating(function (Property $property) {
            $property->slug ??= static::uniqueSlug($property->title);
        });
    }

    /**
     * Build a URL-friendly slug that does not clash with an existing one.
     * "Luxury Flat" -> "luxury-flat", "luxury-flat-2", ...
     */
    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'property';
        $slug = $base;
        $counter = 2;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Use the slug in URLs: /properties/luxury-flat-gulshan.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Area, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /**
     * Who added the listing: the admin or a property owner.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * True when a property owner (not the admin) submitted this listing.
     */
    public function isOwnerSubmission(): bool
    {
        return $this->creator !== null && ! $this->creator->isAdmin();
    }

    /**
     * All photos, cover first.
     *
     * @return HasMany<PropertyImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Only the cover photo (handy for listing cards).
     *
     * @return HasOne<PropertyImage, $this>
     */
    public function coverImage(): HasOne
    {
        return $this->hasOne(PropertyImage::class)->ofMany(['sort_order' => 'min', 'id' => 'min']);
    }

    /**
     * @return BelongsToMany<Feature, $this>
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class);
    }

    /**
     * @return HasMany<Inquiry, $this>
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Only listings visible on the public website.
     *
     * Usage: Property::published()->get();
     *
     * @param  Builder<Property>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', PropertyStatus::Published);
    }

    /**
     * Apply the search filters coming from the listing page.
     *
     * Every key is optional. Supported keys:
     *  q, area, category, type, min_price, max_price,
     *  bedrooms (minimum), bathrooms (minimum), min_size, max_size, sort
     *
     * @param  Builder<Property>  $query
     * @param  array<string, mixed>  $filters
     */
    #[Scope]
    protected function filter(Builder $query, array $filters): void
    {
        $query
            // Free-text keyword search across title, building and address
            ->when($filters['q'] ?? null, function (Builder $q, string $term) {
                $q->where(function (Builder $q) use ($term) {
                    $q->where('title', 'like', "%{$term}%")
                        ->orWhere('building_name', 'like', "%{$term}%")
                        ->orWhere('address', 'like', "%{$term}%");
                });
            })
            ->when($filters['area'] ?? null, fn (Builder $q, string $slug) => $q->whereRelation('area', 'slug', $slug))
            ->when($filters['category'] ?? null, fn (Builder $q, string $slug) => $q->whereRelation('category', 'slug', $slug))
            ->when($filters['type'] ?? null, fn (Builder $q, string $type) => $q->where('listing_type', $type))
            ->when($filters['min_price'] ?? null, fn (Builder $q, $min) => $q->where('price', '>=', (int) $min))
            ->when($filters['max_price'] ?? null, fn (Builder $q, $max) => $q->where('price', '<=', (int) $max))
            ->when($filters['bedrooms'] ?? null, fn (Builder $q, $beds) => $q->where('bedrooms', '>=', (int) $beds))
            ->when($filters['bathrooms'] ?? null, fn (Builder $q, $baths) => $q->where('bathrooms', '>=', (int) $baths))
            ->when($filters['min_size'] ?? null, fn (Builder $q, $min) => $q->where('size_sqft', '>=', (int) $min))
            ->when($filters['max_size'] ?? null, fn (Builder $q, $max) => $q->where('size_sqft', '<=', (int) $max));

        // Sorting (featured listings always float to the top for "newest")
        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'size_desc' => $query->orderByDesc('size_sqft'),
            default => $query->orderByDesc('is_featured')->latest(),
        };
    }
}
