<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * An amenity a property can have (e.g. Wifi, Swimming Pool, Generator).
 *
 * @property int $id
 * @property string $name
 * @property string|null $icon
 */
#[Fillable(['name', 'icon'])]
class Feature extends Model
{
    /**
     * @return BelongsToMany<Property, $this>
     */
    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class);
    }
}
