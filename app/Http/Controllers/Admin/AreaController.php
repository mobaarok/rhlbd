<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel: manage neighbourhoods (Gulshan, Banani...).
 * Everything happens on one page; create/edit use a pop-up dialog.
 */
class AreaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/areas/index', [
            'areas' => Area::withCount('properties')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Area::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Area created.']);

        return back();
    }

    public function update(Request $request, Area $area): RedirectResponse
    {
        $area->update($this->validated($request, $area));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Area updated.']);

        return back();
    }

    public function destroy(Area $area): RedirectResponse
    {
        // Protect listings: an area that still has properties cannot be removed
        if ($area->properties()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Move or delete its properties first.']);

            return back();
        }

        $area->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Area deleted.']);

        return back();
    }

    /**
     * Validate the form and build the slug from the name.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Area $area = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('areas')->ignore($area?->id)],
            'city' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_popular' => ['boolean'],
        ]);

        return [...$data, 'slug' => Str::slug($data['name'])];
    }
}
