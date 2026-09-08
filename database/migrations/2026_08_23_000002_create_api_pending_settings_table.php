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
        if (!Schema::hasTable('api_pending_settings')) {
            Schema::create('api_pending_settings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('api_id');
                $table->string('service_type')->default('Prepaid')->index(); // Prepaid, Postpaid, DTH, etc.
                $table->string('operator_code')->index(); // JIO, AIRTEL, VI, BSNL, etc.
                $table->string('time_frame')->index(); // 7AM-12PM, 5PM-10PM, OTHER
                $table->integer('max_pending_count')->default(0);
                $table->timestamps();

                $table->foreign('api_id')->references('id')->on('api_settings')->onDelete('cascade');
                $table->unique(['api_id', 'service_type', 'operator_code', 'time_frame'], 'api_pending_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_pending_settings');
    }
};
