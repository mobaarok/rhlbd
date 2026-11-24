<?php

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The small version of a property, used on listing cards and grids.
 *
 * Matches the "PropertyCard" TypeScript type in resources/js/types/models.ts.
 *
 * @mixin Property
 */
class PropertyCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'listing_type' => $this->listing_type->value,
            'listing_label' => $this->listing_type->label(),
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'price' => $this->price,
            'price_suffix' => $this->price_period->suffix(),
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking' => $this->parking,
            'size_sqft' => $this->size_sqft,
            'cover_url' => $this->whenLoaded('coverImage', fn () => $this->coverImage?->url),
            'area' => $this->whenLoaded('area', fn () => [
                'name' => $this->area->name,
                'slug' => $this->area->slug,
                'city' => $this->area->city,
            ]),
            'category' => $this->whenLoaded('category', fn () => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
