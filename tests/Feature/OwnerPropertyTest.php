<?php

namespace Tests\Feature;

use App\Enums\PropertyStatus;
use App\Models\Area;
use App\Models\Category;
use App\Models\Property;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use App\Notifications\PropertyReviewedNotification;
use Database\Seeders\LookupSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Tests for "Post your property": owners submit listings, the admin
 * approves or rejects them, and only approved ones appear on the website.
 */
class OwnerPropertyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(LookupSeeder::class);
        Storage::fake('public');
        Notification::fake();
    }

    /**
     * Valid form data for a new listing.
     *
     * @return array<string, mixed>
     */
    private function listingData(array $overrides = []): array
    {
        return [
            'title' => 'Owner Flat in Gulshan',
            'category_id' => Category::first()->id,
            'area_id' => Area::first()->id,
            'listing_type' => 'rent',
            'price' => 90000,
            'price_period' => 'month',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'parking' => 1,
            'size_sqft' => 1800,
            'address' => 'Road 1, Gulshan, Dhaka',
            'description' => 'A nice flat.',
            'images' => [UploadedFile::fake()->image('living.jpg')],
            ...$overrides,
        ];
    }

    /**
     * Create a listing owned by the given owner.
     */
    private function ownersListing(User $owner, PropertyStatus $status): Property
    {
        $this->actingAs($owner)->post('/my-properties', $this->listingData());

        $property = $owner->properties()->firstOrFail();
        $property->status = $status;
        $property->save();

        return $property;
    }

    public function test_owners_information_page_is_public(): void
    {
        $this->get('/for-owners')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/owners'));
    }

    public function test_i_already_have_an_account_link_goes_to_login(): void
    {
        $this->get('/post-property?login=1')->assertRedirect('/login');
    }

    public function test_guests_cannot_open_my_properties(): void
    {
        $this->get('/my-properties')->assertRedirect('/login');
    }

    public function test_owner_submission_is_saved_as_pending_and_admin_is_emailed(): void
    {
        $owner = User::factory()->create();

        $this->actingAs($owner)
            ->post('/my-properties', $this->listingData([
                // These must be ignored: owners can't publish or feature their own listing
                'status' => 'published',
                'is_featured' => true,
            ]))
            ->assertRedirect('/my-properties');

        $property = Property::where('title', 'Owner Flat in Gulshan')->firstOrFail();
        $this->assertSame(PropertyStatus::Pending, $property->status);
        $this->assertFalse($property->is_featured);
        $this->assertSame($owner->id, $property->user_id);
        $this->assertCount(1, $property->images);

        Notification::assertSentOnDemand(NewLeadNotification::class);

        // Not visible on the public site yet
        auth()->logout();
        $this->get("/properties/{$property->slug}")->assertNotFound();
    }

    public function test_a_new_listing_needs_at_least_one_photo(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/my-properties', $this->listingData(['images' => []]))
            ->assertSessionHasErrors('images');
    }

    public function test_owners_cannot_edit_someone_elses_listing(): void
    {
        $listing = $this->ownersListing(User::factory()->create(), PropertyStatus::Pending);

        $this->actingAs(User::factory()->create())
            ->get("/my-properties/{$listing->slug}/edit")
            ->assertNotFound();

        $this->delete("/my-properties/{$listing->slug}")->assertNotFound();
        $this->assertModelExists($listing);
    }

    public function test_editing_a_published_listing_sends_it_back_for_review(): void
    {
        $owner = User::factory()->create();
        $listing = $this->ownersListing($owner, PropertyStatus::Published);

        $this->actingAs($owner)
            ->put("/my-properties/{$listing->slug}", $this->listingData(['title' => 'Updated title', 'images' => []]))
            ->assertRedirect('/my-properties');

        $listing->refresh();
        $this->assertSame('Updated title', $listing->title);
        $this->assertSame(PropertyStatus::Pending, $listing->status);
    }

    public function test_admin_can_approve_an_owner_listing(): void
    {
        $owner = User::factory()->create();
        $listing = $this->ownersListing($owner, PropertyStatus::Pending);

        $this->actingAs(User::factory()->admin()->create())
            ->patch("/admin/properties/{$listing->slug}/approve")
            ->assertRedirect();

        $this->assertSame(PropertyStatus::Published, $listing->fresh()->status);
        Notification::assertSentTo($owner, PropertyReviewedNotification::class, fn ($n) => $n->approved);

        auth()->logout();
        $this->get("/properties/{$listing->slug}")->assertOk();
    }

    public function test_admin_rejects_with_a_reason_the_owner_can_see(): void
    {
        $owner = User::factory()->create();
        $listing = $this->ownersListing($owner, PropertyStatus::Pending);
        $admin = User::factory()->admin()->create();

        // A reason is required
        $this->actingAs($admin)
            ->patch("/admin/properties/{$listing->slug}/reject", ['reason' => ''])
            ->assertSessionHasErrors('reason');

        $this->actingAs($admin)
            ->patch("/admin/properties/{$listing->slug}/reject", ['reason' => 'Photos too dark'])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame(PropertyStatus::Rejected, $listing->status);
        $this->assertSame('Photos too dark', $listing->rejection_reason);
        Notification::assertSentTo($owner, PropertyReviewedNotification::class, fn ($n) => ! $n->approved);

        // The owner sees the reason on "My properties"
        $this->actingAs($owner)
            ->get('/my-properties')
            ->assertInertia(fn ($page) => $page
                ->component('owner/properties/index')
                ->where('properties.0.status', 'rejected')
                ->where('properties.0.rejection_reason', 'Photos too dark'));
    }

    public function test_owners_cannot_approve_listings(): void
    {
        $owner = User::factory()->create();
        $listing = $this->ownersListing($owner, PropertyStatus::Pending);

        $this->actingAs($owner)
            ->patch("/admin/properties/{$listing->slug}/approve")
            ->assertForbidden();
    }

    public function test_admin_visiting_my_properties_is_sent_to_the_admin_panel(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/my-properties')
            ->assertRedirect('/admin/properties');
    }
}
