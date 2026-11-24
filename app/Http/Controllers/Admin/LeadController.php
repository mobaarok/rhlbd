<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Inquiry;
use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel inboxes: property inquiries, contact messages and newsletter subscribers.
 *
 * Kept in one controller because the three screens are small and very similar.
 */
class LeadController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Property inquiries
    |--------------------------------------------------------------------------
    */

    public function inquiries(): Response
    {
        return Inertia::render('admin/leads/inquiries', [
            'inquiries' => Inquiry::with('property:id,title,slug')->latest()->paginate(20),
        ]);
    }

    /**
     * Toggle the read / unread state of an inquiry.
     */
    public function toggleInquiryRead(Inquiry $inquiry): RedirectResponse
    {
        $inquiry->update(['read_at' => $inquiry->read_at ? null : now()]);

        return back();
    }

    public function destroyInquiry(Inquiry $inquiry): RedirectResponse
    {
        $inquiry->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Inquiry deleted.']);

        return back();
    }

    /*
    |--------------------------------------------------------------------------
    | Contact messages
    |--------------------------------------------------------------------------
    */

    public function messages(): Response
    {
        return Inertia::render('admin/leads/messages', [
            'messages' => ContactMessage::latest()->paginate(20),
        ]);
    }

    public function toggleMessageRead(ContactMessage $message): RedirectResponse
    {
        $message->update(['read_at' => $message->read_at ? null : now()]);

        return back();
    }

    public function destroyMessage(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Message deleted.']);

        return back();
    }

    /*
    |--------------------------------------------------------------------------
    | Newsletter subscribers
    |--------------------------------------------------------------------------
    */

    public function subscribers(): Response
    {
        return Inertia::render('admin/leads/subscribers', [
            'subscribers' => Subscriber::latest()->paginate(50),
        ]);
    }

    public function destroySubscriber(Subscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subscriber removed.']);

        return back();
    }
}
