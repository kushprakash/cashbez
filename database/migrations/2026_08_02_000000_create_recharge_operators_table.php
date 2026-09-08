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
        Schema::create('recharge_operators', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('operator_code', 50)->unique();
            $table->string('service_type', 100);
            $table->string('margin_mode', 50)->default('Flat');
            $table->boolean('fetch_bill')->default(false);
            $table->string('logo', 500)->nullable();
            $table->decimal('min_amount', 12, 2)->default(0.00);
            $table->decimal('max_amount', 12, 2)->default(0.00);
            $table->decimal('stop_amount', 12, 2)->nullable()->default(0.00);
            $table->string('number_length', 50)->nullable();
            $table->boolean('status')->default(true);
            $table->boolean('api_status')->default(true);
            $table->json('bill_parameters')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['service_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recharge_operators');
    }
};
