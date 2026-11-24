<?php

namespace Tests\Feature;

use App\Enums\PropertyStatus;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\Subscriber;
use App\Models\User;
use Database\Seeders\LookupSeeder;
use Database\Seeders\PropertySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Tests for the public website: home, listings, filters, detail page and forms.
 */
class PublicSiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Load the demo areas, categories and listings
        $this->seed([LookupSeeder::class, PropertySeeder::class]);
    }

    public function test_home_page_shows_featured_and_latest_properties(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/home')
                ->has('featured.data')
                ->has('latest.data', 8)
                ->has('categories')
                ->where('stats.properties', Property::published()->count()));
    }

    public function test_listing_can_be_filtered_by_type_and_bedrooms(): void
    {
        $this->get('/properties?type=sale&bedrooms=4')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/properties/index')
                ->where('properties.data', fn ($items) => collect($items)->every(
                    fn ($item) => $item['listing_type'] === 'sale' && $item['bedrooms'] >= 4
                )));
    }

    public function test_invalid_filters_are_ignored_instead_of_erroring(): void
    {
        $this->get('/properties?type=banana&bedrooms=-5&sort=nope')->assertOk();
    }

    public function test_area_page_only_shows_that_area(): void
    {
        $this->get('/areas/gulshan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('lockedFilters', ['area'])
                ->where('properties.data', fn ($items) => collect($items)->every(
                    fn ($item) => $item['area']['slug'] === 'gulshan'
                )));
    }

    public function test_property_page_shows_details_and_counts_a_view(): void
    {
        $property = Property::published()->first();
        $views = $property->views;

        $this->get("/properties/{$property->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/properties/show')
                ->where('property.data.id', $property->id)
                ->has('property.data.images'));

        $this->assertSame($views + 1, $property->fresh()->views);
    }

    public function test_draft_properties_are_hidden_from_visitors(): void
    {
        $property = Property::first();
        $property->update(['status' => PropertyStatus::Draft]);

        $this->get("/properties/{$property->slug}")->assertNotFound();
    }

    public function test_visitor_can_send_an_inquiry(): void
    {
        $property = Property::first();

        $this->post('/inquiries', [
            'property_id' => $property->id,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '01700000000',
            'message' => 'Is it still available?',
        ])->assertRedirect();

        $this->assertDatabaseHas(Inquiry::class, ['property_id' => $property->id, 'name' => 'Jane Doe']);
    }

    public function test_bots_filling_the_honeypot_are_rejected(): void
    {
        $this->post('/inquiries', [
            'property_id' => Property::first()->id,
            'name' => 'Bot',
            'email' => 'bot@example.com',
            'phone' => '000',
            'message' => 'spam',
            'website' => 'http://spam.example',
        ])->assertSessionHasErrors('website');

        $this->assertDatabaseCount(Inquiry::class, 0);
    }

    public function test_newsletter_subscription_does_not_create_duplicates(): void
    {
        $this->post('/subscribe', ['email' => 'A@Example.com']);
        $this->post('/subscribe', ['email' => 'a@example.com']);

        $this->assertSame(1, Subscriber::count());
    }

    public function test_saved_page_shows_only_published_properties_in_saved_order(): void
    {
        [$first, $second, $hidden] = Property::take(3)->get();
        $hidden->update(['status' => PropertyStatus::Pending]);

        $this->get("/saved?ids={$second->id},{$hidden->id},{$first->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/saved')
                ->has('properties.data', 2)
                ->where('properties.data.0.id', $second->id)
                ->where('properties.data.1.id', $first->id));
    }

    public function test_pending_properties_are_hidden_from_visitors_but_visible_to_their_owner(): void
    {
        $owner = User::factory()->create();
        $property = Property::first();
        $property->user_id = $owner->id;
        $property->status = PropertyStatus::Pending;
        $property->save();

        $this->get("/properties/{$property->slug}")->assertNotFound();
        $this->actingAs(User::factory()->create())->get("/properties/{$property->slug}")->assertNotFound();
        $this->actingAs($owner)->get("/properties/{$property->slug}")->assertOk();
    }
}
