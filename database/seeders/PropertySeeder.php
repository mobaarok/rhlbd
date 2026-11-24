<?php

namespace Database\Seeders;

use App\Enums\ListingType;
use App\Enums\PricePeriod;
use App\Enums\PropertyStatus;
use App\Models\Area;
use App\Models\Category;
use App\Models\Feature;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds realistic demo listings using the photos in public/images/properties.
 * Replace with real listings before going live.
 */
class PropertySeeder extends Seeder
{
    /**
     * Photo sets: the first photo of each set becomes the cover.
     *
     * @var array<string, array<int, string>>
     */
    private const PHOTO_SETS = [
        'apartment' => ['living-1', 'kitchen-1', 'bedroom-1', 'living-4'],
        'apartment2' => ['living-2', 'bedroom-2', 'kitchen-2', 'living-5'],
        'apartment3' => ['living-3', 'living-6', 'bedroom-1', 'kitchen-1'],
        'luxury' => ['living-5', 'living-6', 'bedroom-2', 'kitchen-2', 'exterior-4'],
        'house' => ['exterior-1', 'living-4', 'kitchen-1', 'bedroom-1'],
        'villa' => ['exterior-4', 'exterior-3', 'living-5', 'bedroom-2'],
        'office' => ['office-1', 'office-2', 'office-3'],
        'building' => ['building-1', 'building-2', 'office-3'],
    ];

    public function run(): void
    {
        $areas = Area::pluck('id', 'slug');
        $categories = Category::pluck('id', 'slug');
        $allFeatureIds = Feature::pluck('id');

        foreach ($this->listings() as $index => $data) {
            $property = Property::updateOrCreate(
                ['code' => sprintf('RH-%04d', 1001 + $index)],
                [
                    'title' => $data['title'],
                    'category_id' => $categories[$data['category']],
                    'area_id' => $areas[$data['area']],
                    'listing_type' => $data['type'] ?? ListingType::Rent,
                    'status' => PropertyStatus::Published,
                    'is_featured' => $data['featured'] ?? false,
                    'price' => $data['price'],
                    'price_period' => ($data['type'] ?? ListingType::Rent) === ListingType::Sale ? PricePeriod::Total : PricePeriod::Month,
                    'bedrooms' => $data['beds'],
                    'bathrooms' => $data['baths'],
                    'parking' => $data['parking'] ?? 1,
                    'floor' => $data['floor'] ?? null,
                    'size_sqft' => $data['size'],
                    'building_name' => $data['building'] ?? null,
                    'address' => $data['address'],
                    'map_embed_url' => 'https://maps.google.com/maps?q='.urlencode($data['address']).'&z=15&output=embed',
                    'description' => $data['description'],
                    'nearby' => [
                        ['name' => 'Hospital', 'distance' => '1.2 km'],
                        ['name' => 'Supermarket', 'distance' => '400 m'],
                        ['name' => 'School', 'distance' => '800 m'],
                    ],
                    'views' => random_int(20, 900),
                ],
            );

            // Replace photos so re-running the seeder does not duplicate them
            $property->images()->delete();
            foreach (self::PHOTO_SETS[$data['photos']] as $order => $photo) {
                $property->images()->create([
                    'path' => "/images/properties/{$photo}.jpg",
                    'sort_order' => $order,
                ]);
            }

            $property->features()->sync($allFeatureIds->random(min(7, $allFeatureIds->count())));
        }

        $this->seedOwnerSubmissions();
    }

    /**
     * Give the demo owner (powner@rhlbd.com) a few listings so the
     * "My properties" page and the admin review queue have something to show:
     * one already published, one waiting for review and one rejected.
     */
    private function seedOwnerSubmissions(): void
    {
        $owner = User::where('email', 'powner@rhlbd.com')->first();
        $admin = User::where('is_admin', true)->first();

        if (! $owner) {
            return;
        }

        // The admin "added" every other demo listing
        Property::whereNull('user_id')->update(['user_id' => $admin?->id]);

        // Listing 1: already approved and live
        Property::where('code', 'RH-1007')->update(['user_id' => $owner->id]);

        // Listings 2 and 3: copies of existing demo listings, pending and rejected
        $samples = [
            ['code' => 'RH-1004', 'title' => 'Owner Listed 3 Bed Flat in Dhanmondi', 'status' => PropertyStatus::Pending, 'reason' => null],
            ['code' => 'RH-1009', 'title' => 'Owner Listed Apartment in Bashundhara', 'status' => PropertyStatus::Rejected, 'reason' => 'Photos are too dark. Please upload brighter photos of the living room and kitchen.'],
        ];

        foreach ($samples as $sample) {
            $source = Property::with(['images', 'features'])->where('code', $sample['code'])->first();
            if (! $source || Property::where('title', $sample['title'])->exists()) {
                continue;
            }

            $copy = $source->replicate(['slug', 'code', 'views', 'is_featured']);
            $copy->title = $sample['title'];
            $copy->user_id = $owner->id;
            $copy->status = $sample['status'];
            $copy->rejection_reason = $sample['reason'];
            $copy->save();

            foreach ($source->images as $image) {
                $copy->images()->create($image->only(['path', 'sort_order']));
            }
            $copy->features()->sync($source->features->pluck('id'));
        }
    }

    /**
     * Demo listing data.
     *
     * @return array<int, array<string, mixed>>
     */
    private function listings(): array
    {
        $furnished = "This beautifully furnished apartment is ready to move in. It comes with a spacious living and dining area, a fully equipped modern kitchen and bright bedrooms with built-in wardrobes.\n\nThe building offers a lift, a standby generator, 24-hour security with CCTV and a dedicated car parking space. Utilities (gas, water and electricity) are connected and maintenance is handled by a professional caretaker team.\n\nIdeal for expatriates, corporate executives and families looking for comfort in a prime location.";
        $residential = "A well-designed unfurnished apartment with plenty of natural light and cross-ventilation. The layout includes a separate drawing room, family living area, dining space, kitchen with a utility area and a servant room with an attached bath.\n\nThe building has a lift, generator backup, gas connection and round-the-clock security. Schools, hospitals and supermarkets are within walking distance.";
        $commercial = "A flexible commercial floor in a modern building on a main road, suitable for corporate offices, showrooms or co-working spaces. The floor plate is open and can be partitioned to your needs.\n\nThe building includes high-speed lifts, full generator backup, central security, CCTV and dedicated parking for tenants and visitors.";

        return [
            ['title' => 'Elegant 3 Bed Furnished Apartment', 'area' => 'gulshan', 'category' => 'furnished-apartment', 'price' => 180000, 'beds' => 3, 'baths' => 3, 'size' => 2400, 'floor' => 6, 'building' => 'Lake View Residence', 'address' => 'Road 92, Gulshan-2, Dhaka', 'photos' => 'apartment', 'featured' => true, 'description' => $furnished],
            ['title' => 'Luxury Lake-Facing 4 Bed Apartment', 'area' => 'gulshan', 'category' => 'luxury-apartment', 'price' => 350000, 'beds' => 4, 'baths' => 5, 'size' => 4200, 'parking' => 2, 'floor' => 9, 'building' => 'The Lakeshore', 'address' => 'Road 104, Gulshan-2, Dhaka', 'photos' => 'luxury', 'featured' => true, 'description' => $furnished],
            ['title' => 'Modern Serviced Apartment', 'area' => 'banani', 'category' => 'furnished-apartment', 'price' => 150000, 'beds' => 2, 'baths' => 2, 'size' => 1600, 'floor' => 4, 'building' => 'Banani Suites', 'address' => 'Road 11, Banani, Dhaka', 'photos' => 'apartment2', 'featured' => true, 'description' => $furnished],
            ['title' => 'Spacious Family Apartment', 'area' => 'dhanmondi', 'category' => 'residential-apartment', 'price' => 75000, 'beds' => 3, 'baths' => 3, 'size' => 2100, 'floor' => 5, 'address' => 'Road 27, Dhanmondi, Dhaka', 'photos' => 'apartment3', 'description' => $residential],
            ['title' => 'Diplomatic Zone Duplex', 'area' => 'baridhara', 'category' => 'duplex-penthouse', 'price' => 450000, 'beds' => 5, 'baths' => 6, 'size' => 5600, 'parking' => 3, 'floor' => 7, 'building' => 'Park Avenue Duplex', 'address' => 'Park Road, Baridhara, Dhaka', 'photos' => 'villa', 'featured' => true, 'description' => $furnished],
            ['title' => 'Premium Corporate Office Floor', 'area' => 'gulshan', 'category' => 'office-space', 'price' => 600000, 'beds' => 0, 'baths' => 4, 'size' => 6500, 'parking' => 6, 'floor' => 11, 'building' => 'Gulshan Avenue Tower', 'address' => 'Gulshan Avenue, Gulshan-1, Dhaka', 'photos' => 'office', 'featured' => true, 'description' => $commercial],
            ['title' => 'Cozy 2 Bed Apartment Near Lake', 'area' => 'banani', 'category' => 'residential-apartment', 'price' => 65000, 'beds' => 2, 'baths' => 2, 'size' => 1350, 'floor' => 3, 'address' => 'Road 4, Banani, Dhaka', 'photos' => 'apartment2', 'description' => $residential],
            ['title' => 'Furnished Apartment with Rooftop Pool', 'area' => 'gulshan', 'category' => 'furnished-apartment', 'price' => 250000, 'beds' => 3, 'baths' => 4, 'size' => 3000, 'floor' => 8, 'building' => 'Skyline Heights', 'address' => 'Road 71, Gulshan-2, Dhaka', 'photos' => 'luxury', 'featured' => true, 'description' => $furnished],
            ['title' => 'Bright Apartment in Bashundhara', 'area' => 'bashundhara-ra', 'category' => 'residential-apartment', 'price' => 45000, 'beds' => 3, 'baths' => 3, 'size' => 1750, 'floor' => 6, 'address' => 'Block D, Bashundhara R/A, Dhaka', 'photos' => 'apartment3', 'description' => $residential],
            ['title' => 'Ground Floor Showroom Space', 'area' => 'banani', 'category' => 'commercial-space', 'price' => 280000, 'beds' => 0, 'baths' => 2, 'size' => 3200, 'parking' => 4, 'floor' => 0, 'address' => 'Kemal Ataturk Avenue, Banani, Dhaka', 'photos' => 'building', 'description' => $commercial],
            ['title' => 'Ready Flat for Sale in Uttara', 'area' => 'uttara', 'category' => 'residential-apartment', 'type' => ListingType::Sale, 'price' => 18500000, 'beds' => 3, 'baths' => 3, 'size' => 1650, 'floor' => 5, 'address' => 'Sector 7, Uttara, Dhaka', 'photos' => 'apartment', 'description' => $residential],
            ['title' => 'Luxury Penthouse for Sale', 'area' => 'gulshan', 'category' => 'duplex-penthouse', 'type' => ListingType::Sale, 'price' => 125000000, 'beds' => 4, 'baths' => 5, 'size' => 5200, 'parking' => 3, 'floor' => 14, 'building' => 'Crown Residency', 'address' => 'Road 113, Gulshan-2, Dhaka', 'photos' => 'luxury', 'featured' => true, 'description' => $furnished],
            ['title' => 'Furnished Studio for Executives', 'area' => 'baridhara', 'category' => 'furnished-apartment', 'price' => 95000, 'beds' => 1, 'baths' => 1, 'size' => 900, 'floor' => 3, 'address' => 'Road 6, Baridhara, Dhaka', 'photos' => 'apartment2', 'description' => $furnished],
            ['title' => 'Commercial Building for Rent', 'area' => 'badda', 'category' => 'full-building', 'price' => 1200000, 'beds' => 0, 'baths' => 12, 'size' => 18000, 'parking' => 10, 'address' => 'Pragati Sarani, Badda, Dhaka', 'photos' => 'building', 'description' => $commercial],
            ['title' => 'Family Apartment in Mirpur DOHS', 'area' => 'mirpur-dohs', 'category' => 'residential-apartment', 'price' => 55000, 'beds' => 3, 'baths' => 3, 'size' => 1900, 'floor' => 4, 'address' => 'Avenue 3, Mirpur DOHS, Dhaka', 'photos' => 'house', 'description' => $residential],
            ['title' => 'Affordable Flat in Aftab Nagar', 'area' => 'aftab-nagar', 'category' => 'residential-apartment', 'type' => ListingType::Sale, 'price' => 7800000, 'beds' => 3, 'baths' => 2, 'size' => 1250, 'floor' => 2, 'address' => 'Block C, Aftab Nagar, Dhaka', 'photos' => 'apartment3', 'description' => $residential],
            ['title' => 'Co-working Ready Office', 'area' => 'banani', 'category' => 'office-space', 'price' => 220000, 'beds' => 0, 'baths' => 2, 'size' => 2800, 'parking' => 2, 'floor' => 6, 'address' => 'Road 17, Banani, Dhaka', 'photos' => 'office', 'description' => $commercial],
            ['title' => 'Garden View 4 Bed Apartment', 'area' => 'dhanmondi', 'category' => 'luxury-apartment', 'price' => 160000, 'beds' => 4, 'baths' => 4, 'size' => 3100, 'floor' => 5, 'address' => 'Road 8A, Dhanmondi, Dhaka', 'photos' => 'house', 'description' => $furnished],
        ];
    }
}
