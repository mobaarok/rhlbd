<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * The page a user lands on after logging in (/dashboard).
 *
 * - The admin is sent to the admin panel.
 * - Property owners are sent to their "My properties" page.
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        return $request->user()->isAdmin()
            ? to_route('admin.dashboard')
            : to_route('owner.properties.index');
    }
}
