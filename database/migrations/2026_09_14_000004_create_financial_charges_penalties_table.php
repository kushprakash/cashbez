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
        Schema::create('financial_charges_penalties', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('admin_id')->index();

            $table->string('service_type')->default('ALL'); // SAVING, DD, RD, FD, MIS, ALL, MEMBERSHIP
            $table->string('category')->default('CHARGE'); // CHARGE, PENALTY
            $table->string('charge_type')->nullable(); // MEMBERSHIP, ACCOUNT_OPENING, DEPOSIT, WITHDRAWAL, ACCOUNT_CLOSURE, STATEMENT, DUPLICATE_PASSBOOK, NOMINEE_CHANGE, MATURITY, PREMATURE_CLOSURE, OTHER
            $table->string('penalty_type')->nullable(); // DD_LATE_PAYMENT, RD_LATE_INSTALLMENT, MINIMUM_BALANCE, PREMATURE_FD, ACCOUNT_DORMANCY, OTHER
            
            $table->string('name');
            $table->decimal('amount', 18, 2)->default(0.00);
            $table->decimal('percentage', 5, 2)->default(0.00);
            
            $table->boolean('gst_applicable')->default(false);
            $table->decimal('gst_percentage', 5, 2)->default(0.00);
            
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->string('status')->default('ACTIVE'); // ACTIVE, INACTIVE

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_charges_penalties');
    }
};
