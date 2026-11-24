<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Entry point for "php artisan db:seed" (or "php artisan migrate:fresh --seed").
 *
 * DEMO LOGINS:
 *   Admin:  admin@rhlbd.com   / config('site.demo.admin_password')  ("password" locally,
 *                                a random secret on the public Render demo)
 *   Owner:  powner@rhlbd.com  / config('site.demo.owner_password')  ("password")
 *
 * Users are created without factories on purpose: factories need the Faker
 * package, which is only installed for development, not on the live server.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Model events stay enabled on purpose: Property uses one to build its slug.

        $admin = new User([
            'name' => 'Admin',
            'email' => 'admin@rhlbd.com',
            'phone' => '01700000000',
            'password' => config('site.demo.admin_password'),
        ]);
        // is_admin is not mass-assignable (security), so set it directly
        $admin->forceFill(['is_admin' => true, 'email_verified_at' => now()])->save();

        $owner = new User([
            'name' => 'Property Owner',
            'email' => 'powner@rhlbd.com',
            'phone' => '01800000000',
            'password' => config('site.demo.owner_password'),
        ]);
        $owner->forceFill(['email_verified_at' => now()])->save();

        $this->call([
            LookupSeeder::class,
            PropertySeeder::class,
        ]);
    }
}
