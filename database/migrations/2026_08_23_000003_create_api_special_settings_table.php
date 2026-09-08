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
        if (!Schema::hasTable('api_special_settings')) {
            Schema::create('api_special_settings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('api_id');
                $table->string('circle')->nullable()->default('ALL')->index(); // Circle code or ALL
                $table->string('operator_code')->index(); // JIO, AIRTEL, VI, BSNL, etc.
                $table->decimal('amount', 10, 2)->index(); // Special Plan Amount
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('api_id')->references('id')->on('api_settings')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_special_settings');
    }
};
