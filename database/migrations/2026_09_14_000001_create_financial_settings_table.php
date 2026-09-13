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
        Schema::create('financial_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('admin_id')->index();

            // General Settings
            $table->string('financial_service_name')->default('Financial Services');
            $table->string('financial_service_code')->default('FIN');
            $table->string('currency')->default('INR');
            $table->string('financial_year')->default('2026-2027');
            $table->string('member_id_prefix')->default('MEM');
            $table->string('account_number_prefix')->default('ACC');
            $table->string('transaction_id_prefix')->default('TXN');
            $table->string('receipt_prefix')->default('REC');
            $table->integer('minimum_member_age')->default(18);
            $table->integer('maximum_member_age')->default(80);

            // KYC Settings
            $table->boolean('kyc_required_at_account_opening')->default(false);
            $table->boolean('kyc_required_at_withdrawal')->default(true);
            $table->boolean('aadhaar_verification_required')->default(false);
            $table->boolean('pan_verification_required')->default(false);
            $table->boolean('bank_verification_required')->default(false);
            $table->boolean('withdrawal_approval_required')->default(false);

            // Account & Transaction Settings
            $table->boolean('account_opening_approval_required')->default(false);
            $table->boolean('account_closure_approval_required')->default(false);
            $table->boolean('transaction_approval_required')->default(false);

            // Withdrawal Limits
            $table->decimal('minimum_withdrawal', 18, 2)->default(100.00);
            $table->decimal('maximum_withdrawal', 18, 2)->default(100000.00);
            $table->decimal('daily_withdrawal_limit', 18, 2)->default(50000.00);
            $table->decimal('monthly_withdrawal_limit', 18, 2)->default(500000.00);
            $table->decimal('cash_withdrawal_limit', 18, 2)->default(25000.00);
            $table->decimal('bank_transfer_limit', 18, 2)->default(100000.00);

            // Maturity Settings
            $table->integer('maturity_notification_days')->default(7);
            $table->integer('prematurity_notification_days')->default(7);
            $table->boolean('maturity_payment_approval_required')->default(true);
            $table->boolean('maturity_kyc_required')->default(true);
            $table->boolean('maturity_bank_verification_required')->default(true);

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
        Schema::dropIfExists('financial_settings');
    }
};
