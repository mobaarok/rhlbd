<?php

/*
|--------------------------------------------------------------------------
| Site settings
|--------------------------------------------------------------------------
|
| Business contact details shown across the public website (header,
| footer, floating WhatsApp button, property pages). The values come
| from the .env file so they can differ between local and production.
|
| Usage in PHP:   config('site.phone')
| Usage in React: usePage().props.site.phone  (shared in HandleInertiaRequests)
|
*/

return [

    'phone' => env('SITE_PHONE', '+8801700000000'),

    // WhatsApp number in international format WITHOUT "+" or spaces (used in wa.me links)
    'whatsapp' => env('SITE_WHATSAPP', '8801700000000'),

    'email' => env('SITE_EMAIL', 'hello@example.com'),

    'address' => env('SITE_ADDRESS', 'Gulshan, Dhaka, Bangladesh'),

    // Social media pages shown as icons in the footer.
    // Leave a value empty in .env and its icon is still shown, but not clickable.
    'social' => [
        'facebook' => env('SITE_FACEBOOK_URL'),
        'instagram' => env('SITE_INSTAGRAM_URL'),
        'youtube' => env('SITE_YOUTUBE_URL'),
        'linkedin' => env('SITE_LINKEDIN_URL'),
    ],

    // Currency symbol used when formatting prices
    'currency' => '৳',

];
