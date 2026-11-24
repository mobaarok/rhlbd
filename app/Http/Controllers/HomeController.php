<?php

namespace App\Http\Controllers;

use App\Http\Resources\PropertyCardResource;
use App\Models\Area;
use App\Models\Category;
use App\Models\Property;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public home page.
 */
class HomeController extends Controller
{
    public function __invoke(): Response
    {
        // Relations every property card needs (avoids N+1 queries)
        $cardRelations = ['coverImage', 'area', 'category'];

        return Inertia::render('public/home', [
            'featured' => PropertyCardResource::collection(
                Property::published()->where('is_featured', true)->with($cardRelations)->latest()->take(6)->get()
            ),
            'latest' => PropertyCardResource::collection(
                Property::published()->with($cardRelations)->latest()->take(8)->get()
            ),
            'categories' => Category::query()
                ->withCount(['properties' => fn ($q) => $q->published()])
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'icon']),
            'popularAreas' => Area::query()
                ->where('is_popular', true)
                ->withCount(['properties' => fn ($q) => $q->published()])
                ->orderByDesc('properties_count')
                ->take(6)
                ->get(['id', 'name', 'slug', 'city', 'image']),
            'areas' => Area::orderBy('name')->get(['name', 'slug']),
            'stats' => [
                'properties' => Property::published()->count(),
                'areas' => Area::count(),
                'categories' => Category::count(),
            ],
        ]);
    }
}
