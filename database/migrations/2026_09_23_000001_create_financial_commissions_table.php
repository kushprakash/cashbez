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
        Schema::create('financial_commissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('role_id')->nullable()->index(); // Null = Applies to All Roles

            // Supported: NEW_MEMBER, SAVING_OPENING, RD_OPENING, DD_OPENING, FD_OPENING, MIS_OPENING, RD_DEPOSIT, DD_DEPOSIT
            $table->string('service_type', 50)->index();
            $table->string('name')->nullable();

            // Dynamic Slab vs Flat: 0 = Flat/Non-Slab, 1 = Slab Range
            $table->boolean('is_slab')->default(false);
            $table->decimal('from_amount', 18, 2)->default(0.00);
            $table->decimal('to_amount', 18, 2)->default(0.00);

            // Calculation Type: 'flat' (Fixed ₹) or 'percentage' (%)
            $table->string('commission_type', 20)->default('flat');
            $table->decimal('commission_value', 18, 2)->default(0.00);

            // Optional Distributor Upline Commission
            $table->string('distributor_commission_type', 20)->nullable()->default('flat');
            $table->decimal('distributor_commission_value', 18, 2)->default(0.00);

            $table->string('status', 20)->default('ACTIVE'); // ACTIVE, INACTIVE

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->index(['admin_id', 'service_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_commissions');
    }
};
