<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\ListingType;
use App\Enums\PricePeriod;
use App\Enums\PropertyStatus;
use App\Models\Area;
use App\Models\Category;
use App\Models\Feature;
use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Code shared by the two property forms:
 *  - Admin\PropertyController (admin panel)
 *  - Owner\PropertyController (property owners' "Post your property")
 *
 * Saving photos, deleting photos and building the dropdown options.
 */
trait HandlesPropertyForm
{
    /**
     * The fields of the request that map straight onto Property columns.
     *
     * @return array<string, mixed>
     */
    protected function propertyAttributes(Request $request): array
    {
        /** @var FormRequest $request */
        return $request->safe()->except(['feature_ids', 'images', 'remove_image_ids']);
    }

    /**
     * Save new photo uploads to storage/app/public/properties and link them.
     * New photos are added after the existing ones.
     */
    protected function storeUploadedImages(Request $request, Property $property): void
    {
        $nextOrder = (int) $property->images()->max('sort_order') + 1;

        foreach ($request->file('images', []) as $file) {
            $property->images()->create([
                'path' => $file->store('properties', 'public'),
                'sort_order' => $nextOrder++,
            ]);
        }
    }

    /**
     * Delete the photos whose IDs are listed in "remove_image_ids".
     */
    protected function removeImages(Request $request, Property $property): void
    {
        $property->images()
            ->whereIn('id', $request->input('remove_image_ids', []))
            ->get()
            ->each(function ($image) {
                if ($image->isUploaded()) {
                    Storage::disk('public')->delete($image->path);
                }
                $image->delete();
            });
    }

    /**
     * Delete a property together with its uploaded photo files.
     */
    protected function deleteProperty(Property $property): void
    {
        foreach ($property->images as $image) {
            if ($image->isUploaded()) {
                Storage::disk('public')->delete($image->path);
            }
        }

        $property->delete();
    }

    /**
     * The property's current values, in the shape the React form expects.
     *
     * @return array<string, mixed>
     */
    protected function formValues(Property $property): array
    {
        $property->load(['images', 'features:id']);

        return [
            ...$property->only([
                'id', 'slug', 'title', 'code', 'category_id', 'area_id', 'is_featured',
                'price', 'bedrooms', 'bathrooms', 'parking', 'floor', 'size_sqft',
                'building_name', 'address', 'map_embed_url', 'description',
                'contact_name', 'contact_phone', 'rejection_reason',
            ]),
            'listing_type' => $property->listing_type->value,
            'status' => $property->status->value,
            'price_period' => $property->price_period->value,
            'nearby' => $property->nearby ?? [],
            'feature_ids' => $property->features->pluck('id'),
            'images' => $property->images->map(fn ($image) => ['id' => $image->id, 'url' => $image->url]),
        ];
    }

    /**
     * Dropdown options the create/edit form needs.
     *
     * @return array<string, mixed>
     */
    protected function formOptions(): array
    {
        return [
            'categories' => Category::orderBy('sort_order')->get(['id', 'name']),
            'areas' => Area::orderBy('name')->get(['id', 'name']),
            'features' => Feature::orderBy('name')->get(['id', 'name']),
            'listingTypes' => $this->enumOptions(ListingType::cases()),
            'statuses' => $this->enumOptions(PropertyStatus::cases()),
            'pricePeriods' => $this->enumOptions(PricePeriod::cases()),
        ];
    }

    /**
     * Turn enum cases into [{value, label}] for <select> elements.
     *
     * @param  array<int, \BackedEnum>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    protected function enumOptions(array $cases): array
    {
        return array_map(fn (\BackedEnum $case) => [
            'value' => (string) $case->value,
            'label' => method_exists($case, 'label') ? $case->label() : ucfirst((string) $case->value),
        ], $cases);
    }
}
