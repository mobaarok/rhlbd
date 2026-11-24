<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

/**
 * A neighbourhood where properties are located (e.g. Gulshan, Banani).
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $city
 * @property string|null $image
 * @property string|null $description
 * @property bool $is_popular
 */
#[Fillable(['name', 'slug', 'city', 'image', 'description', 'is_popular'])]
class Area extends Model
{
    /**
     * Cache key for the popular areas shown in the site footer.
     */
    public const FOOTER_CACHE_KEY = 'footer-areas';

    /**
     * Clear the footer cache whenever an area changes.
     */
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::FOOTER_CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::FOOTER_CACHE_KEY));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_popular' => 'boolean',
        ];
    }

    /**
     * Use the slug in URLs: /areas/gulshan instead of /areas/1.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return HasMany<Property, $this>
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
