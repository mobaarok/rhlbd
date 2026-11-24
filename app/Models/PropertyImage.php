<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * One photo of a property. The photo with the lowest sort_order is the cover.
 *
 * @property int $id
 * @property int $property_id
 * @property string $path
 * @property int $sort_order
 * @property-read string $url
 */
#[Fillable(['path', 'sort_order'])]
#[Appends(['url'])]
class PropertyImage extends Model
{
    /**
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Public URL of the photo.
     *
     * - Uploaded photos live on the "public" disk  -> /storage/properties/abc.jpg
     * - Seed photos live in /public/images         -> /images/properties/living-1.jpg
     * - Full URLs are returned unchanged.
     *
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::get(function (): string {
            if (Str::startsWith($this->path, ['http://', 'https://', '/'])) {
                return $this->path;
            }

            return Storage::disk('public')->url($this->path);
        });
    }

    /**
     * Whether this photo was uploaded (and therefore can be deleted from disk).
     */
    public function isUploaded(): bool
    {
        return ! Str::startsWith($this->path, ['http://', 'https://', '/']);
    }
}
