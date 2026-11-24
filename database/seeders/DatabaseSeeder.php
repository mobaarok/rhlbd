<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Entry point for "php artisan db:seed" (or "php artisan migrate:fresh --seed").
 *
 * DEMO LOGINS (local development only, change before going live):
 *   Admin:  admin@rhlbd.com   / password
 *   Owner:  powner@rhlbd.com  / password  (a property owner with demo submissions)
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Model events stay enabled on purpose: Property uses one to build its slug.

        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@rhlbd.com',
            'phone' => '01700000000',
        ]);

        User::factory()->create([
            'name' => 'Property Owner',
            'email' => 'powner@rhlbd.com',
            'phone' => '01800000000',
        ]);

        $this->call([
            LookupSeeder::class,
            PropertySeeder::class,
        ]);
    }
}
