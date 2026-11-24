<?php

namespace App\Enums;

/**
 * Whether a property is offered for rent or for sale.
 */
enum ListingType: string
{
    case Rent = 'rent';
    case Sale = 'sale';

    /**
     * Human-friendly label shown in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Rent => 'For Rent',
            self::Sale => 'For Sale',
        };
    }
}
