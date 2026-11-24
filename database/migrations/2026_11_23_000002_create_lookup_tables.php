<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lookup tables used to classify properties:
 *  - areas:      neighbourhoods such as Gulshan or Banani
 *  - categories: property kinds such as "Furnished Apartment"
 *  - features:   amenities such as "Wifi" or "Swimming Pool"
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('city')->default('Dhaka');
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable()->comment('Lucide icon name, e.g. "building-2"');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('icon')->nullable()->comment('Lucide icon name, e.g. "wifi"');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('features');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('areas');
    }
};
