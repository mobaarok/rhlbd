<?php

namespace App\Http\Requests;

use App\Enums\ListingType;
use App\Enums\PricePeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validation rules shared by the two property forms:
 *  - Admin\PropertyRequest  (admin panel, adds status / featured / code / contact)
 *  - Owner\PropertyRequest  (property owners posting their own listing)
 */
abstract class BasePropertyRequest extends FormRequest
{
    /**
     * Fields both the admin and owners fill in.
     *
     * @return array<string, mixed>
     */
    protected function sharedRules(): array
    {
        return [
            // Basic information
            'title' => ['required', 'string', 'max:150'],
            'category_id' => ['required', 'exists:categories,id'],
            'area_id' => ['required', 'exists:areas,id'],
            'listing_type' => ['required', Rule::enum(ListingType::class)],

            // Price
            'price' => ['required', 'integer', 'min:0'],
            'price_period' => ['required', Rule::enum(PricePeriod::class)],

            // Size and rooms (no negative numbers allowed)
            'bedrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'parking' => ['required', 'integer', 'min:0', 'max:50'],
            'floor' => ['nullable', 'integer', 'min:0', 'max:200'],
            'size_sqft' => ['required', 'integer', 'min:1'],

            // Location
            'building_name' => ['nullable', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'map_embed_url' => ['nullable', 'url', 'max:2000'],

            // Details
            'description' => ['required', 'string', 'max:10000'],
            'nearby' => ['nullable', 'array', 'max:20'],
            'nearby.*.name' => ['required', 'string', 'max:60'],
            'nearby.*.distance' => ['required', 'string', 'max:30'],
            'feature_ids' => ['nullable', 'array'],
            'feature_ids.*' => ['integer', 'exists:features,id'],

            // Photos: new uploads + IDs of existing photos to delete
            'images' => ['nullable', 'array', 'max:20'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5 MB each
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer'],
        ];
    }

    /**
     * Friendlier names in error messages ("The photo must be an image").
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'category',
            'area_id' => 'area',
            'size_sqft' => 'size',
            'images' => 'photos',
            'images.*' => 'photo',
            'nearby.*.name' => 'place name',
            'nearby.*.distance' => 'distance',
        ];
    }
}
