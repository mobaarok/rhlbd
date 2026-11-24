<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '01700000000',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_post_property_link_sends_guests_to_register_then_to_the_form()
    {
        $this->get(route('post-property'))->assertRedirect(route('register'));

        $this->post(route('register.store'), [
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'phone' => '01700000000',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('owner.properties.create'));
    }

    public function test_new_accounts_are_never_admins()
    {
        $this->post(route('register.store'), [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'phone' => '01700000000',
            'is_admin' => true,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertFalse(User::where('email', 'sneaky@example.com')->first()->isAdmin());
    }
}
