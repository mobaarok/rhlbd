<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PropertyStatus;
use App\Http\Controllers\Concerns\HandlesPropertyForm;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PropertyRequest;
use App\Models\Property;
use App\Notifications\PropertyReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel: create, list, edit and delete property listings,
 * and review (approve / reject) listings submitted by property owners.
 */
class PropertyController extends Controller
{
    use HandlesPropertyForm;

    /**
     * GET /admin/properties: table of all properties with search + status filter.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $properties = Property::query()
            ->with(['area:id,name', 'category:id,name', 'coverImage', 'creator:id,name,is_admin'])
            ->when($search, fn ($q) => $q->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Property $property) => [
                'id' => $property->id,
                'slug' => $property->slug,
                'title' => $property->title,
                'code' => $property->code,
                'cover_url' => $property->coverImage?->url,
                'area' => $property->area->name,
                'category' => $property->category->name,
                'listing_type' => $property->listing_type->value,
                'status' => $property->status->value,
                'is_featured' => $property->is_featured,
                'price' => $property->price,
                'price_suffix' => $property->price_period->suffix(),
                'views' => $property->views,
                // Name of the owner who submitted it (null = added by the admin)
                'owner' => $property->isOwnerSubmission() ? $property->creator->name : null,
            ]);

        return Inertia::render('admin/properties/index', [
            'properties' => $properties,
            'filters' => ['search' => $search, 'status' => $status],
            'statuses' => $this->enumOptions(PropertyStatus::cases()),
            'pendingCount' => Property::where('status', PropertyStatus::Pending)->count(),
        ]);
    }

    /**
     * GET /admin/properties/create
     */
    public function create(): Response
    {
        return Inertia::render('admin/properties/form', $this->formOptions());
    }

    /**
     * POST /admin/properties
     */
    public function store(PropertyRequest $request): RedirectResponse
    {
        $property = new Property($this->propertyAttributes($request));
        $property->user_id = $request->user()->id;
        $property->save();

        $property->features()->sync($request->input('feature_ids', []));
        $this->storeUploadedImages($request, $property);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property created.']);

        return to_route('admin.properties.edit', $property);
    }

    /**
     * GET /admin/properties/{property}/edit
     */
    public function edit(Property $property): Response
    {
        $property->load('creator');

        return Inertia::render('admin/properties/form', [
            ...$this->formOptions(),
            'property' => $this->formValues($property),
            // Contact details of the owner who submitted it (null = added by the admin)
            'owner' => $property->isOwnerSubmission()
                ? $property->creator->only(['name', 'email', 'phone'])
                : null,
        ]);
    }

    /**
     * PUT /admin/properties/{property}
     */
    public function update(PropertyRequest $request, Property $property): RedirectResponse
    {
        $property->fill($this->propertyAttributes($request));

        // Keep the URL in sync when the title changes
        if ($property->isDirty('title')) {
            $property->slug = Property::uniqueSlug($property->title, $property->id);
        }

        // A rejection reason only makes sense while the listing is rejected
        if ($property->status !== PropertyStatus::Rejected) {
            $property->rejection_reason = null;
        }

        $property->save();
        $property->features()->sync($request->input('feature_ids', []));

        $this->removeImages($request, $property);
        $this->storeUploadedImages($request, $property);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property updated.']);

        return to_route('admin.properties.edit', $property);
    }

    /**
     * PATCH /admin/properties/{property}/approve: publish an owner's listing.
     */
    public function approve(Property $property): RedirectResponse
    {
        $property->status = PropertyStatus::Published;
        $property->rejection_reason = null;
        $property->save();

        $this->notifyOwner($property, approved: true);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property approved and published.']);

        return back();
    }

    /**
     * PATCH /admin/properties/{property}/reject: send it back with a reason.
     */
    public function reject(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $property->status = PropertyStatus::Rejected;
        $property->rejection_reason = $validated['reason'];
        $property->save();

        $this->notifyOwner($property, approved: false);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property rejected. The owner can see your reason.']);

        return back();
    }

    /**
     * DELETE /admin/properties/{property}
     */
    public function destroy(Property $property): RedirectResponse
    {
        $this->deleteProperty($property);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property deleted.']);

        return to_route('admin.properties.index');
    }

    /**
     * E-mail the owner the result of the review (only for owner submissions).
     */
    private function notifyOwner(Property $property, bool $approved): void
    {
        if ($property->isOwnerSubmission()) {
            $property->creator->notify(new PropertyReviewedNotification($property, $approved));
        }
    }
}
