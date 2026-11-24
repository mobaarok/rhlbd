<?php

namespace App\Http\Controllers\Owner;

use App\Enums\PropertyStatus;
use App\Http\Controllers\Concerns\HandlesPropertyForm;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\PropertyRequest;
use App\Models\Property;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "My properties" for property owners ( /my-properties/... ).
 *
 * Owners post their own listings here. Every new or edited listing is
 * saved as "Pending review" and only goes live after the admin approves
 * it in the admin panel. Owners can only see and change their OWN listings.
 */
class PropertyController extends Controller
{
    use HandlesPropertyForm;

    /**
     * GET /my-properties: the owner's listings with their review status.
     */
    public function index(Request $request): Response
    {
        $properties = $request->user()->properties()
            ->with(['area:id,name', 'coverImage'])
            ->get()
            ->map(fn (Property $property) => [
                'id' => $property->id,
                'slug' => $property->slug,
                'title' => $property->title,
                'cover_url' => $property->coverImage?->url,
                'area' => $property->area->name,
                'listing_type' => $property->listing_type->value,
                'status' => $property->status->value,
                'rejection_reason' => $property->rejection_reason,
                'price' => $property->price,
                'price_suffix' => $property->price_period->suffix(),
                'views' => $property->views,
                'updated_at' => $property->updated_at,
            ]);

        return Inertia::render('owner/properties/index', [
            'properties' => $properties,
        ]);
    }

    /**
     * GET /my-properties/create
     */
    public function create(): Response
    {
        return Inertia::render('owner/properties/form', $this->formOptions());
    }

    /**
     * POST /my-properties: save a new listing as "Pending review".
     */
    public function store(PropertyRequest $request): RedirectResponse
    {
        $property = new Property($this->propertyAttributes($request));
        $property->user_id = $request->user()->id;
        $property->status = PropertyStatus::Pending;
        $property->save();

        $property->features()->sync($request->input('feature_ids', []));
        $this->storeUploadedImages($request, $property);

        $this->notifyAdmin($property, 'New property submitted for review');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Thank you! Your property was sent for review. We will publish it after checking.',
        ]);

        return to_route('owner.properties.index');
    }

    /**
     * GET /my-properties/{property}/edit
     */
    public function edit(Request $request, Property $property): Response
    {
        $this->ensureOwns($request, $property);

        return Inertia::render('owner/properties/form', [
            ...$this->formOptions(),
            'property' => $this->formValues($property),
        ]);
    }

    /**
     * PUT /my-properties/{property}: any change sends it back for review.
     */
    public function update(PropertyRequest $request, Property $property): RedirectResponse
    {
        $this->ensureOwns($request, $property);

        $property->fill($this->propertyAttributes($request));

        // Keep the URL in sync when the title changes
        if ($property->isDirty('title')) {
            $property->slug = Property::uniqueSlug($property->title, $property->id);
        }

        $property->status = PropertyStatus::Pending;
        $property->rejection_reason = null;
        $property->save();

        $property->features()->sync($request->input('feature_ids', []));
        $this->removeImages($request, $property);
        $this->storeUploadedImages($request, $property);

        $this->notifyAdmin($property, 'Property edited, please review again');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Changes saved. Your property is waiting for review again.',
        ]);

        return to_route('owner.properties.index');
    }

    /**
     * DELETE /my-properties/{property}
     */
    public function destroy(Request $request, Property $property): RedirectResponse
    {
        $this->ensureOwns($request, $property);

        $this->deleteProperty($property);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Property deleted.']);

        return to_route('owner.properties.index');
    }

    /**
     * Owners may only touch their own listings (404 hides that others exist).
     */
    private function ensureOwns(Request $request, Property $property): void
    {
        abort_unless($property->user_id === $request->user()->id, 404);
    }

    /**
     * E-mail the business address so the admin knows something needs review.
     */
    private function notifyAdmin(Property $property, string $subject): void
    {
        $owner = request()->user();

        Notification::route('mail', config('site.email'))->notify(new NewLeadNotification(
            $subject,
            [
                "Property: {$property->title}",
                "Owner: {$owner->name} ({$owner->email}, {$owner->phone})",
            ],
            route('admin.properties.edit', $property),
        ));
    }
}
