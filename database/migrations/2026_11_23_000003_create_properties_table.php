<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Property listings, their photos and their amenities.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            // Who added it: the admin, or the property owner who submitted it.
            // Owner listings are deleted together with the owner's account.
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete()->comment('Admin or owner who added it');
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->constrained()->restrictOnDelete();

            // Basic information
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('code', 30)->nullable()->unique()->comment('Internal reference, e.g. RH-1024');
            $table->string('listing_type', 10)->comment('See App\Enums\ListingType');
            $table->string('status', 20)->default('draft')->comment('See App\Enums\PropertyStatus');
            $table->boolean('is_featured')->default(false);
            $table->text('rejection_reason')->nullable()->comment('Why the admin rejected an owner submission');

            // Price (stored as whole Taka, no decimals needed)
            $table->unsignedBigInteger('price');
            $table->string('price_period', 10)->default('month')->comment('See App\Enums\PricePeriod');

            // Size and rooms
            $table->unsignedTinyInteger('bedrooms')->default(0);
            $table->unsignedTinyInteger('bathrooms')->default(0);
            $table->unsignedTinyInteger('parking')->default(0);
            $table->unsignedSmallInteger('floor')->nullable()->comment('Which floor the unit is on');
            $table->unsignedInteger('size_sqft');

            // Location
            $table->string('building_name')->nullable();
            $table->string('address');
            $table->text('map_embed_url')->nullable()->comment('Google Maps embed "src" URL');

            // Details
            $table->longText('description');
            $table->json('nearby')->nullable()->comment('List of {name, distance}, e.g. Hospital - 1 km');

            // Contact for this listing (falls back to the site phone when empty)
            $table->string('contact_name')->nullable();
            $table->string('contact_phone', 30)->nullable();

            $table->unsignedInteger('views')->default(0);
            $table->timestamps();

            // Indexes for the most common search filters
            $table->index(['status', 'listing_type']);
            $table->index('price');
            $table->index('bedrooms');
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->string('path')->comment('Path on the "public" disk, or a full URL / /images path for seed data');
            $table->unsignedSmallInteger('sort_order')->default(0)->comment('0 = cover photo');
            $table->timestamps();
        });

        Schema::create('feature_property', function (Blueprint $table) {
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->primary(['feature_id', 'property_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_property');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
    }
};
