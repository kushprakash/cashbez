<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * CMS Transactions table for tracking FingPay CMS (Cash Management System) transactions
     * This stores all CDC (Cash Deposit Collection) transactions between BC and FingPay
     */
    public function up(): void
    {
        Schema::create('cms_transactions', function (Blueprint $table) {
            $table->id();
            
            // FingPay transaction reference
            $table->string('fp_transaction_id')->unique()->comment('FingPay transaction ID');
            $table->string('merchant_transaction_id')->unique()->comment('Our merchant transaction ID');
            
            // BC (Business Correspondent) details
            $table->string('bc_login_id')->comment('BC login ID / Merchant ID');
            $table->unsignedBigInteger('user_id')->comment('User ID in our system');
            $table->unsignedBigInteger('account_id')->comment('Account ID that was debited');
            
            // Transaction details
            $table->decimal('amount', 15, 2)->comment('Transaction amount');
            $table->string('type', 20)->default('CDC')->comment('Transaction type (CDC = Cash Deposit Collection)');
            
            // Status tracking
            $table->enum('status', ['initiated', 'pending', 'success', 'failed', 'refunded'])
                  ->default('initiated')
                  ->comment('Our transaction status');
            $table->string('fp_status', 5)->nullable()->comment('FingPay status (I=Initiated, S=Success, F=Failed)');
            
            // Additional info
            $table->text('remarks')->nullable();
            $table->text('error_message')->nullable();
            
            // Callback tracking
            $table->boolean('callback_received')->default(false);
            $table->string('callback_status')->nullable();
            $table->text('callback_message')->nullable();
            $table->json('callback_data')->nullable();
            $table->timestamp('callback_timestamp')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index('bc_login_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            
            // Foreign keys (optional - uncomment if you have proper foreign key constraints)
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_transactions');
    }
};
