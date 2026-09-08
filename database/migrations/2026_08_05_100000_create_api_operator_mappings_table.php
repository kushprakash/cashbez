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
        Schema::create('api_operator_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('api_id');
            $table->unsignedBigInteger('utility_operator_id')->nullable();
            $table->string('category', 100)->nullable();
            $table->string('operator_code', 100)->nullable(); // Internal code from utility_operators
            $table->string('api_operator_code', 100)->nullable(); // Provider specific code (e.g. VF, AT, JIO)
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('api_id')->references('id')->on('api_settings')->onDelete('cascade');
            $table->index(['api_id', 'category']);
            $table->unique(['api_id', 'utility_operator_id'], 'api_utility_operator_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_operator_mappings');
    }
};
