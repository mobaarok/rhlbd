<?php

namespace App\Enums;

/**
 * Publishing state of a property listing.
 *
 * Only "published" properties are visible on the public website.
 *
 * Life of a listing posted by a property owner:
 *   owner submits → Pending → admin approves → Published
 *                           → admin rejects  → Rejected (owner sees the reason,
 *                                              fixes it and resubmits → Pending)
 * Whenever an owner edits a listing it goes back to Pending.
 */
enum PropertyStatus: string
{
    case Pending = 'pending';
    case Published = 'published';
    case Rejected = 'rejected';
    case Draft = 'draft';
    case Rented = 'rented';
    case Sold = 'sold';

    /**
     * Human-friendly label shown in the admin panel and owner dashboard.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending review',
            default => ucfirst($this->value),
        };
    }
}
