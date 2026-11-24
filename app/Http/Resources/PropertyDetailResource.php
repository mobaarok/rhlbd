<?php

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;

/**
 * The full version of a property, used on the property detail page.
 * Extends the card version and adds photos, amenities, description, etc.
 *
 * Matches the "PropertyDetail" TypeScript type in resources/js/types/models.ts.
 *
 * @mixin Property
 */
class PropertyDetailResource extends PropertyCardResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'code' => $this->code,
            'floor' => $this->floor,
            'building_name' => $this->building_name,
            'address' => $this->address,
            'map_embed_url' => $this->map_embed_url,
            'description' => $this->description,
            'nearby' => $this->nearby ?? [],
            'contact_name' => $this->contact_name,
            'contact_phone' => $this->contact_phone,
            'views' => $this->views,
            'listed_at' => $this->created_at->toDateString(),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
            ])),
            'features' => $this->whenLoaded('features', fn () => $this->features->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'icon' => $feature->icon,
            ])),
        ];
    }
}
