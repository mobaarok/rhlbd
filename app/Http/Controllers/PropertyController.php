<?php

namespace App\Http\Controllers;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Http\Resources\PropertyCardResource;
use App\Http\Resources\PropertyDetailResource;
use App\Models\Area;
use App\Models\Category;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public property pages: search/listing, area pages, category pages and detail.
 */
class PropertyController extends Controller
{
    /**
     * How many properties to show per page in listings.
     */
    private const PER_PAGE = 12;

    /**
     * GET /properties — search page with filters in the query string.
     * Example: /properties?type=rent&area=gulshan&bedrooms=3&sort=price_asc
     */
    public function index(Request $request): Response
    {
        return $this->renderListing($request, heading: 'All Properties');
    }

    /**
     * GET /areas/{area} — all properties in one neighbourhood.
     */
    public function byArea(Request $request, Area $area): Response
    {
        return $this->renderListing(
            $request,
            heading: "Properties in {$area->name}",
            preset: ['area' => $area->slug],
            description: $area->description,
        );
    }

    /**
     * GET /categories/{category} — all properties of one kind.
     */
    public function byCategory(Request $request, Category $category): Response
    {
        return $this->renderListing(
            $request,
            heading: $category->name,
            preset: ['category' => $category->slug],
            description: $category->description,
        );
    }

    /**
     * GET /saved?ids=3,8,12: the visitor's saved homes.
     *
     * The list of IDs lives in the visitor's browser (localStorage); the
     * page sends it here to get the property cards. Only published ones show.
     */
    public function saved(Request $request): Response
    {
        $ids = collect(explode(',', $request->string('ids')->toString()))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->take(100)
            ->values();

        $properties = $ids->isEmpty()
            ? collect()
            : Property::published()
                ->whereIn('id', $ids)
                ->with(['coverImage', 'area', 'category'])
                ->get()
                // Keep the order the visitor saved them in (newest first)
                ->sortBy(fn (Property $property) => $ids->search($property->id))
                ->values();

        return Inertia::render('public/saved', [
            'properties' => PropertyCardResource::collection($properties),
            'requested' => $request->has('ids'),
        ]);
    }

    /**
     * GET /properties/{property} — the property detail page.
     */
    public function show(Request $request, Property $property): Response
    {
        // Unpublished properties are only visible to the admin and to the
        // owner who submitted them (so they can preview their listing)
        $user = $request->user();
        $canPreview = $user !== null
            && ($user->isAdmin() || $property->user_id === $user->id);
        abort_if($property->status !== PropertyStatus::Published && ! $canPreview, 404);

        // Count a view without touching "updated_at"
        $property->incrementQuietly('views');

        $property->load(['images', 'features', 'area', 'category', 'coverImage']);

        // Similar listings: same area or same category, excluding this one
        $related = Property::published()
            ->whereKeyNot($property->id)
            ->where(fn ($q) => $q->where('area_id', $property->area_id)->orWhere('category_id', $property->category_id))
            ->with(['coverImage', 'area', 'category'])
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('public/properties/show', [
            'property' => new PropertyDetailResource($property),
            'related' => PropertyCardResource::collection($related),
        ]);
    }

    /**
     * Shared logic for every listing page.
     *
     * @param  array<string, string>  $preset  Filters fixed by the URL (e.g. the area of an area page)
     */
    private function renderListing(
        Request $request,
        string $heading,
        array $preset = [],
        ?string $description = null,
    ): Response {
        // Validate the query string so bad values are simply ignored, not errors
        $filters = validator($request->query(), [
            'q' => ['nullable', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::enum(ListingType::class)],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:1', 'max:10'],
            'bathrooms' => ['nullable', 'integer', 'min:1', 'max:10'],
            'min_size' => ['nullable', 'integer', 'min:0'],
            'max_size' => ['nullable', 'integer', 'min:0'],
            'sort' => ['nullable', Rule::in(Property::SORT_OPTIONS)],
        ])->valid();

        // Values coming from the URL path always win over the query string
        $filters = [...$filters, ...$preset];

        $properties = Property::published()
            ->filter($filters)
            ->with(['coverImage', 'area', 'category'])
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('public/properties/index', [
            'heading' => $heading,
            'description' => $description,
            'filters' => (object) $filters,
            'lockedFilters' => array_keys($preset),
            'properties' => PropertyCardResource::collection($properties),
            'areas' => Area::orderBy('name')->get(['name', 'slug']),
            'categories' => Category::orderBy('sort_order')->get(['name', 'slug']),
        ]);
    }
}
