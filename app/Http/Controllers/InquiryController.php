<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Models\Inquiry;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

/**
 * Handles the "Send inquiry" form on the property detail page.
 */
class InquiryController extends Controller
{
    public function store(StoreInquiryRequest $request): RedirectResponse
    {
        $inquiry = Inquiry::create([
            ...$request->safe()->except('website'),
            'user_id' => $request->user()?->id,
        ]);

        // Let the business know a new lead arrived
        Notification::route('mail', config('site.email'))->notify(new NewLeadNotification(
            subject: 'New property inquiry',
            lines: [
                "Property: {$inquiry->property?->title}",
                "Name: {$inquiry->name}",
                "Phone: {$inquiry->phone}",
                "E-mail: {$inquiry->email}",
                "Message: {$inquiry->message}",
            ],
            actionUrl: route('admin.inquiries.index'),
        ));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Thank you! We will contact you shortly.']);

        return back();
    }
}
