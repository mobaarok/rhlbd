<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A kind of property (e.g. Furnished Apartment, Office Space).
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $icon
 * @property string|null $description
 * @property int $sort_order
 */
#[Fillable(['name', 'slug', 'icon', 'description', 'sort_order'])]
class Category extends Model
{
    /**
     * Use the slug in URLs: /categories/office-space instead of /categories/5.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return HasMany<Property, $this>
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
