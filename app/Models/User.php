<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * A person who can log in. There are only two kinds:
 *  - the admin (is_admin = 1): manages the whole site at /admin
 *  - property owners (everyone else): register themselves to post their
 *    properties, which the admin reviews before they go live.
 * Ordinary visitors do NOT need an account.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property bool $is_admin
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
// Note: "is_admin" is intentionally NOT fillable, so visitors can never make themselves admin.
#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Default values for new users (matches the database defaults).
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_admin' => false,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Whether this user may open the admin panel.
     */
    public function isAdmin(): bool
    {
        // (bool) also covers a freshly created user whose attribute is not loaded yet
        return (bool) $this->is_admin;
    }

    /**
     * Properties this owner submitted (newest first).
     *
     * @return HasMany<Property, $this>
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class)->latest();
    }
}
