<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_daily_closings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('admin_id');
            $table->date('closing_date');
            
            $table->decimal('opening_balance', 18, 2)->default(0.00);
            $table->decimal('total_deposit', 18, 2)->default(0.00);
            $table->decimal('total_withdrawal', 18, 2)->default(0.00);
            $table->decimal('closing_balance', 18, 2)->default(0.00);
            $table->decimal('physical_cash', 18, 2)->default(0.00);
            $table->decimal('difference', 18, 2)->default(0.00);

            $table->string('status')->default('PENDING'); // PENDING, APPROVED, REJECTED
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'admin_id', 'closing_date']);
        });

        Schema::create('financial_maturities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('admin_id');

            $table->string('service_type'); // DD, RD, FD, MIS
            $table->decimal('principal', 18, 2);
            $table->decimal('interest_earned', 18, 2)->default(0.00);
            $table->decimal('penalty', 18, 2)->default(0.00);
            $table->decimal('final_amount', 18, 2);
            $table->date('maturity_date');

            $table->string('status')->default('PENDING_PAYOUT'); // PENDING_PAYOUT, PAID, RENEWED, REJECTED
            $table->string('payout_mode')->default('UTILITY_WALLET'); // UTILITY_WALLET, CASH, BANK

            $table->timestamps();

            $table->index(['user_id', 'admin_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_maturities');
        Schema::dropIfExists('financial_daily_closings');
    }
};
