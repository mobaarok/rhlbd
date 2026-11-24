<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PropertyStatus;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\Subscriber;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin panel home: key numbers and the latest leads at a glance.
 */
class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'published' => Property::where('status', PropertyStatus::Published)->count(),
                // Owner submissions waiting for the admin to approve / reject
                'pending' => Property::where('status', PropertyStatus::Pending)->count(),
                'drafts' => Property::where('status', PropertyStatus::Draft)->count(),
                'unreadInquiries' => Inquiry::whereNull('read_at')->count(),
                'unreadMessages' => ContactMessage::whereNull('read_at')->count(),
                'subscribers' => Subscriber::count(),
                'users' => User::where('is_admin', false)->count(),
                'totalViews' => (int) Property::sum('views'),
            ],
            'latestInquiries' => Inquiry::with('property:id,title,slug')->latest()->take(6)->get(),
            'topProperties' => Property::orderByDesc('views')->take(5)->get(['id', 'title', 'slug', 'views']),
        ]);
    }
}
