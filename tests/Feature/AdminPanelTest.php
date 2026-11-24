<?php

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Category;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\LookupSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Tests for the admin panel: access control and property management.
 */
class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(LookupSeeder::class);
    }

    public function test_regular_users_cannot_open_the_admin_panel(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admins_are_redirected_from_dashboard_to_admin_panel(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/dashboard')
            ->assertRedirect('/admin');
    }

    public function test_every_admin_page_loads(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        foreach (['/admin', '/admin/properties', '/admin/properties/create', '/admin/areas',
            '/admin/categories', '/admin/features', '/admin/inquiries', '/admin/messages', '/admin/subscribers'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_admin_can_create_a_property_with_photos(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/properties', [
            'title' => 'Test Apartment',
            'category_id' => Category::first()->id,
            'area_id' => Area::first()->id,
            'listing_type' => 'rent',
            'status' => 'published',
            'is_featured' => true,
            'price' => 120000,
            'price_period' => 'month',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'parking' => 1,
            'size_sqft' => 1800,
            'address' => 'Road 1, Gulshan',
            'description' => 'A lovely flat.',
            'nearby' => [['name' => 'School', 'distance' => '500 m']],
            'images' => [UploadedFile::fake()->image('room.jpg')],
        ])->assertRedirect('/admin/properties/test-apartment/edit');

        $property = Property::where('slug', 'test-apartment')->firstOrFail();
        $this->assertSame($admin->id, $property->user_id);
        $this->assertCount(1, $property->images);
        Storage::disk('public')->assertExists($property->images->first()->path);
    }

    public function test_negative_numbers_are_rejected(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->post('/admin/properties', ['bedrooms' => -3, 'price' => -1])
            ->assertSessionHasErrors(['bedrooms', 'price']);
    }

    public function test_area_with_properties_cannot_be_deleted(): void
    {
        $area = Area::first();
        Property::create([
            'title' => 'Linked',
            'category_id' => Category::first()->id,
            'area_id' => $area->id,
            'listing_type' => 'rent',
            'price' => 1,
            'size_sqft' => 1,
            'address' => 'x',
            'description' => 'x',
        ]);

        $this->actingAs(User::factory()->admin()->create())->delete("/admin/areas/{$area->slug}");

        $this->assertModelExists($area);
    }
}
