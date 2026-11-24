<?php

namespace App\Http\Middleware;

use App\Enums\PropertyStatus;
use App\Models\Area;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],

            // Business contact details, see config/site.php
            'site' => config('site'),

            // Popular areas for the footer links. Cached; the cache is cleared
            // whenever an area is saved or deleted (see Area::booted()).
            'footerAreas' => fn () => Cache::rememberForever(Area::FOOTER_CACHE_KEY, fn () => Area::query()
                ->where('is_popular', true)
                ->orderBy('name')
                ->get(['name', 'slug'])
                // Cache plain arrays, not models: Laravel 13 refuses to
                // unserialize objects from the cache for security reasons.
                ->toArray()),

            // Admin only: owner submissions waiting for review (badge in the sidebar)
            'pendingCount' => fn () => $user?->isAdmin()
                ? Property::where('status', PropertyStatus::Pending)->count()
                : 0,

            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
