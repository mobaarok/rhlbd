<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for the "Send inquiry" form on a property page.
 */
class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // anyone, logged in or not, may ask about a property
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:2000'],

            // Honeypot: a hidden field real people never fill in. Bots usually do.
            'website' => ['prohibited'],
        ];
    }
}
