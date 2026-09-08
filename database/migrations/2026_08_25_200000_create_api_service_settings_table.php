<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('api_service_settings', function (Blueprint $table) {
            $table->id();
            $table->string('service_type')->unique();
            $table->boolean('profit_only')->default(false);
            $table->unsignedBigInteger('api_1')->nullable();
            $table->unsignedBigInteger('api_2')->nullable();
            $table->unsignedBigInteger('api_3')->nullable();
            $table->unsignedBigInteger('api_4')->nullable();
            $table->unsignedBigInteger('pending_api_1')->nullable();
            $table->unsignedBigInteger('pending_api_2')->nullable();
            $table->timestamps();

            $table->foreign('api_1')->references('id')->on('api_settings')->onDelete('set null');
            $table->foreign('api_2')->references('id')->on('api_settings')->onDelete('set null');
            $table->foreign('api_3')->references('id')->on('api_settings')->onDelete('set null');
            $table->foreign('api_4')->references('id')->on('api_settings')->onDelete('set null');
            $table->foreign('pending_api_1')->references('id')->on('api_settings')->onDelete('set null');
            $table->foreign('pending_api_2')->references('id')->on('api_settings')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_service_settings');
    }
};
