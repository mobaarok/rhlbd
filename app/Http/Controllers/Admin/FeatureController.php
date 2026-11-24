<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel: manage amenities (Wifi, Generator, Swimming Pool...).
 */
class FeatureController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/features/index', [
            'features' => Feature::withCount('properties')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Feature::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Feature created.']);

        return back();
    }

    public function update(Request $request, Feature $feature): RedirectResponse
    {
        $feature->update($this->validated($request, $feature));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Feature updated.']);

        return back();
    }

    public function destroy(Feature $feature): RedirectResponse
    {
        // Safe to delete: the pivot rows are removed automatically (cascade)
        $feature->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Feature deleted.']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Feature $feature = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('features')->ignore($feature?->id)],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);
    }
}
