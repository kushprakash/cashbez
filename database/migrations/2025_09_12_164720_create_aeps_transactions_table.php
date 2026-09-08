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
        Schema::create('aeps_transactions', function (Blueprint $table) {
            $table->id(); // BIGINT AUTO_INCREMENT PRIMARY KEY
            $table->string('user_id', 50);
            $table->text('machine_json_data')->nullable();
            $table->string('customer_mobile', 15)->nullable();
            $table->string('aadhaar_number', 20)->nullable();
            $table->decimal('longitude', 12, 8)->nullable();
            $table->decimal('latitude', 12, 8)->nullable();
            $table->string('bank_id', 20)->nullable();
            $table->string('bank_name', 255)->nullable();
            $table->string('device_type', 50)->nullable();
            $table->string('aeps_type', 10)->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->boolean('auth3way')->default(0);
            $table->string('merchant_txn_id', 50)->nullable();
            $table->json('request')->nullable();
            $table->json('response')->nullable();
            $table->boolean('response_status')->nullable();
            $table->string('response_message', 255)->nullable();
            $table->string('response_status_code', 20)->nullable();
            $table->string('admin_id', 50);
            $table->string('created_by', 50);
            $table->timestamps(); // This creates both created_at and updated_at DATETIME columns
            
            // Add indexes for better performance
            $table->index('user_id');
            $table->index('merchant_txn_id');
            $table->index('aeps_type');
            $table->index('response_status');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aeps_transactions');
    }
};
