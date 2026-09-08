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
        Schema::create('api_settings', function (Blueprint $table) {
            $table->id();
            $table->string('api_name', 200);
            $table->string('api_short_name', 100);
            $table->string('ip_address', 100)->nullable();
            $table->boolean('only_fetch_bill')->default(false);
            $table->json('services')->nullable();
            
            $table->decimal('first_low_balance_alert', 12, 2)->nullable();
            $table->decimal('second_low_balance_alert', 12, 2)->nullable();
            $table->decimal('third_low_balance_alert', 12, 2)->nullable();

            $table->json('recharge_config')->nullable();
            $table->json('status_check_config')->nullable();
            $table->json('balance_config')->nullable();
            $table->json('callback_config')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_settings');
    }
};
