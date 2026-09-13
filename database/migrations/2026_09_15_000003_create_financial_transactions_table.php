<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique(); // e.g. TXN-FIN-20260915-XXXXX
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('user_id'); // Agent
            $table->unsignedBigInteger('admin_id'); // Tenant Admin

            $table->string('service_type'); // SAVING, DD, RD, FD, MIS, MEMBERSHIP
            $table->string('txn_type'); // DEPOSIT, WITHDRAWAL, INTEREST, CHARGE, MATURITY, MEMBERSHIP_FEE
            
            $table->decimal('amount', 18, 2);
            $table->decimal('charges', 18, 2)->default(0.00);
            $table->decimal('net_amount', 18, 2);
            $table->decimal('balance_before', 18, 2)->default(0.00);
            $table->decimal('balance_after', 18, 2)->default(0.00);

            $table->string('payment_mode')->default('UTILITY_WALLET'); // UTILITY_WALLET, CASH, ONLINE
            $table->string('reference')->nullable();
            $table->text('narration')->nullable();

            $table->string('status')->default('SUCCESS'); // SUCCESS, PENDING, FAILED, REVERSED

            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
            $table->index(['account_id', 'created_at']);
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
