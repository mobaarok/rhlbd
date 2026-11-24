<?php

use App\Http\Controllers\Admin\AreaController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeatureController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\PropertyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin panel  (/admin/...)
|--------------------------------------------------------------------------
| Only logged-in users with users.is_admin = 1 can open these pages
| (see App\Http\Middleware\EnsureUserIsAdmin).
| Every route name starts with "admin.", e.g. route('admin.properties.index').
| The React pages live in resources/js/pages/admin/...
*/

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        // Properties: full create / edit / delete
        Route::resource('properties', PropertyController::class)->except('show');

        // Review listings submitted by property owners
        Route::patch('properties/{property}/approve', [PropertyController::class, 'approve'])->name('properties.approve');
        Route::patch('properties/{property}/reject', [PropertyController::class, 'reject'])->name('properties.reject');

        // Lookup lists (managed on one page each with a pop-up form)
        Route::resource('areas', AreaController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('features', FeatureController::class)->only(['index', 'store', 'update', 'destroy']);

        // Leads inboxes
        Route::get('inquiries', [LeadController::class, 'inquiries'])->name('inquiries.index');
        Route::patch('inquiries/{inquiry}/read', [LeadController::class, 'toggleInquiryRead'])->name('inquiries.read');
        Route::delete('inquiries/{inquiry}', [LeadController::class, 'destroyInquiry'])->name('inquiries.destroy');

        Route::get('messages', [LeadController::class, 'messages'])->name('messages.index');
        Route::patch('messages/{message}/read', [LeadController::class, 'toggleMessageRead'])->name('messages.read');
        Route::delete('messages/{message}', [LeadController::class, 'destroyMessage'])->name('messages.destroy');

        Route::get('subscribers', [LeadController::class, 'subscribers'])->name('subscribers.index');
        Route::delete('subscribers/{subscriber}', [LeadController::class, 'destroySubscriber'])->name('subscribers.destroy');
    });
