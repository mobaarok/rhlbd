<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Newsletter sign-up form in the site footer.
 */
class SubscriberController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:150'],
        ]);

        // firstOrCreate: subscribing twice is harmless, no duplicate rows
        Subscriber::firstOrCreate(['email' => strtolower($validated['email'])]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subscribed! Watch your inbox for new listings.']);

        return back();
    }
}
