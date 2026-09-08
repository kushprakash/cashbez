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
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('bank_name')->nullable();
            $table->string('ifsc', 11);
            $table->string('name');
            $table->string('mobile', 15);
            $table->string('account', 20);
            $table->decimal('amount', 15, 2);
            $table->string('transaction_id')->unique();
            $table->decimal('charge', 10, 2)->default(0);
            $table->string('type')->default('IMPS'); // IMPS, NEFT, RTGS
            $table->tinyInteger('status')->default(0); // 0=pending, 1=success, 2=failed, 3=processing
            $table->string('utr')->nullable();
            $table->text('message')->nullable();
            $table->json('api_response')->nullable();
            $table->string('call_back_url')->nullable();
            $table->json('call_back_response')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('transaction_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
