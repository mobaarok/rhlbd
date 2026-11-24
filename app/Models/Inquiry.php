<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A question a visitor sent about a specific property.
 *
 * @property int $id
 * @property int|null $property_id
 * @property int|null $user_id
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property string $message
 * @property Carbon|null $read_at
 * @property Carbon $created_at
 */
#[Fillable(['property_id', 'user_id', 'name', 'email', 'phone', 'message', 'read_at'])]
class Inquiry extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
