<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Give (or remove) admin rights for an existing user.
 *
 * Usage:
 *   php artisan app:make-admin someone@example.com
 *   php artisan app:make-admin someone@example.com --revoke
 */
#[Signature('app:make-admin {email : E-mail of an existing user} {--revoke : Remove admin rights instead}')]
#[Description('Grant or revoke admin panel access for a user')]
class MakeAdminCommand extends Command
{
    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('No user found with that e-mail. Ask them to register first.');

            return self::FAILURE;
        }

        // is_admin is not mass-assignable (for safety), so set it directly
        $user->is_admin = ! $this->option('revoke');
        $user->save();

        $this->info($user->is_admin
            ? "{$user->email} is now an admin."
            : "{$user->email} is no longer an admin.");

        return self::SUCCESS;
    }
}
