<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Notifications\NewLeadNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public Contact page and its form.
 */
class ContactController extends Controller
{
    /**
     * GET /contact
     */
    public function show(): Response
    {
        return Inertia::render('public/contact');
    }

    /**
     * POST /contact
     */
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $message = ContactMessage::create($request->safe()->except('website'));

        Notification::route('mail', config('site.email'))->notify(new NewLeadNotification(
            subject: "New contact message: {$message->subject}",
            lines: [
                "Name: {$message->name}",
                "Phone: {$message->phone}",
                "E-mail: {$message->email}",
                "Message: {$message->message}",
            ],
            actionUrl: route('admin.messages.index'),
        ));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Message sent! We will get back to you soon.']);

        return back();
    }
}
