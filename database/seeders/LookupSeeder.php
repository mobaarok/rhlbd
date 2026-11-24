<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Category;
use App\Models\Feature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds the lookup tables: areas, categories and features.
 * Safe to run more than once (updateOrCreate).
 */
class LookupSeeder extends Seeder
{
    public function run(): void
    {
        // [name, image, popular?, short description]
        $areas = [
            ['Gulshan', 'exterior-1', true, 'Dhaka\'s premier diplomatic and business district, home to embassies, fine dining and luxury apartments.'],
            ['Banani', 'building-1', true, 'A vibrant neighbourhood with modern apartments, cafés and easy access to Gulshan and the airport road.'],
            ['Baridhara', 'exterior-4', true, 'Quiet, green and secure: the diplomatic zone favoured by families and expatriates.'],
            ['Bashundhara R/A', 'building-2', true, 'A planned residential area with wide roads, universities, hospitals and the largest shopping mall nearby.'],
            ['Dhanmondi', 'exterior-5', true, 'A classic residential area around the lake, close to schools, hospitals and restaurants.'],
            ['Uttara', 'exterior-3', true, 'A well-planned suburb near the airport with spacious family apartments.'],
            ['Mirpur DOHS', 'exterior-2', false, 'A secure, well-maintained defence officers\' housing area.'],
            ['Badda', 'building-1', false, 'An affordable and fast-growing area next to Gulshan.'],
            ['Aftab Nagar', 'building-2', false, 'A calm residential project with budget-friendly options.'],
        ];

        foreach ($areas as [$name, $image, $popular, $description]) {
            Area::updateOrCreate(['slug' => Str::slug($name)], [
                'name' => $name,
                'city' => 'Dhaka',
                'image' => "/images/properties/{$image}.jpg",
                'is_popular' => $popular,
                'description' => $description,
            ]);
        }

        // [name, lucide icon]
        $categories = [
            ['Furnished Apartment', 'sofa'],
            ['Residential Apartment', 'home'],
            ['Luxury Apartment', 'gem'],
            ['Commercial Space', 'store'],
            ['Office Space', 'briefcase'],
            ['Duplex & Penthouse', 'building'],
            ['Full Building', 'building-2'],
        ];

        foreach ($categories as $index => [$name, $icon]) {
            Category::updateOrCreate(['slug' => Str::slug($name)], [
                'name' => $name,
                'icon' => $icon,
                'sort_order' => $index,
                'description' => "Browse verified {$name} listings in the best neighbourhoods of Dhaka.",
            ]);
        }

        // [name, lucide icon]
        $features = [
            ['Wifi', 'wifi'], ['Parking', 'car'], ['Swimming Pool', 'waves'],
            ['Balcony', 'sun'], ['Rooftop Garden', 'trees'], ['24/7 Security', 'shield-check'],
            ['Gym', 'dumbbell'], ['Air Conditioning', 'air-vent'], ['Lift', 'arrow-up-down'],
            ['Generator Backup', 'zap'], ['CCTV', 'cctv'], ['Pets Allowed', 'paw-print'],
            ['Gas Connection', 'flame'], ['Servant Room', 'bed-single'],
        ];

        foreach ($features as [$name, $icon]) {
            Feature::updateOrCreate(['name' => $name], ['icon' => $icon]);
        }
    }
}
