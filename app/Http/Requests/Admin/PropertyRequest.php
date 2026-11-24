<?php

namespace App\Http\Requests\Admin;

use App\Enums\PropertyStatus;
use App\Http\Requests\BasePropertyRequest;
use App\Models\Property;
use Illuminate\Validation\Rule;

/**
 * Validation for creating AND updating a property in the admin panel.
 * The shared fields are in BasePropertyRequest; the admin can also set
 * the status, "featured", the internal code and the contact person.
 */
class PropertyRequest extends BasePropertyRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Property|null $property Present when updating */
        $property = $this->route('property');

        return [
            ...$this->sharedRules(),
            'code' => ['nullable', 'string', 'max:30', Rule::unique('properties', 'code')->ignore($property?->id)],
            'status' => ['required', Rule::enum(PropertyStatus::class)],
            'is_featured' => ['boolean'],
            'contact_name' => ['nullable', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
