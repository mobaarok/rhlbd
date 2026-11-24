<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\Owner\PropertyController as OwnerPropertyController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SubscriberController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public website
|--------------------------------------------------------------------------
| Pages anyone can open without logging in.
| The React page for each route lives in resources/js/pages/public/...
*/

Route::get('/', HomeController::class)->name('home');

// Listings & search
Route::get('/properties', [PropertyController::class, 'index'])->name('properties.index');
Route::get('/properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
Route::get('/areas/{area}', [PropertyController::class, 'byArea'])->name('areas.show');
Route::get('/categories/{category}', [PropertyController::class, 'byCategory'])->name('categories.show');

// Static pages
Route::inertia('/about', 'public/about')->name('about');
Route::get('/contact', [ContactController::class, 'show'])->name('contact.show');

// Forms (rate-limited to 5 submissions per minute per visitor to stop spam)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
    Route::post('/inquiries', [InquiryController::class, 'store'])->name('inquiries.store');
    Route::post('/subscribe', [SubscriberController::class, 'store'])->name('subscribers.store');
});

// Favourites saved in the visitor's browser (no login needed)
Route::get('/saved', [PropertyController::class, 'saved'])->name('properties.saved');

/*
|--------------------------------------------------------------------------
| "Post your property"
|--------------------------------------------------------------------------
| Visitors who are not logged in are asked to create an owner account
| first; after signing up they land straight on the form.
*/

// Information page for property owners ("Are you a property owner?")
Route::inertia('/for-owners', 'public/owners')->name('owners');

Route::get('/post-property', function (Request $request) {
    if (! $request->user()) {
        // Remember where to go after registering / logging in
        redirect()->setIntendedUrl(route('owner.properties.create'));

        // ?login=1 → the owner already has an account
        return $request->boolean('login') ? to_route('login') : to_route('register');
    }

    return $request->user()->isAdmin()
        ? to_route('admin.properties.create')
        : to_route('owner.properties.create');
})->name('post-property');

/*
|--------------------------------------------------------------------------
| Logged-in users (the admin and property owners)
|--------------------------------------------------------------------------
| Login / register / password reset routes are registered by Laravel Fortify
| (see app/Providers/FortifyServiceProvider.php and config/fortify.php).
*/

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Property owners: their own listings (every change is reviewed by the admin)
    Route::middleware('owner')->name('owner.')->group(function () {
        Route::resource('my-properties', OwnerPropertyController::class)
            ->except('show')
            ->parameters(['my-properties' => 'property'])
            ->names('properties');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
