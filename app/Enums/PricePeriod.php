<?php

namespace App\Enums;

/**
 * The time period a price refers to.
 *
 * Rentals are usually priced per month; sales use "total".
 */
enum PricePeriod: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
    case Year = 'year';
    case Total = 'total';

    /**
     * Suffix printed after the price, e.g. "৳150,000 /month".
     */
    public function suffix(): string
    {
        return $this === self::Total ? '' : '/'.$this->value;
    }
}
