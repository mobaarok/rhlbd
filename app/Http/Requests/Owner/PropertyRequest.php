<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\BasePropertyRequest;

/**
 * Validation for a property owner's "Post your property" form
 * (create and edit). Owners can NOT set the status, "featured", the
 * internal code or the contact person: those are for the admin only.
 * A new listing needs at least one photo.
 */
class PropertyRequest extends BasePropertyRequest
{
    public function authorize(): bool
    {
        // Ownership of an existing listing is checked in the controller
        return $this->user() !== null && ! $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = $this->sharedRules();

        // Creating: at least one photo is required
        if ($this->route('property') === null) {
            $rules['images'] = ['required', 'array', 'min:1', 'max:20'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Please add at least one photo of the property.',
        ];
    }
}
