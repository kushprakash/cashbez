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
        Schema::create('aeps_drafts', function (Blueprint $table) {
            $table->id();
            $table->string('mid');
            
            // Location Information
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            
            // Shop Information
            $table->string('shop_city');
            $table->text('shop_address');
            $table->string('state_id');
            $table->string('shop_district');
            $table->string('shop_pin_code');
            $table->string('shop_name');
            
            // Personal Information
            $table->string('pan_no');
            $table->string('aadhaar_number');
            $table->string('full_name');
            $table->string('phone');
            $table->string('email');
            
            // Bank Information
            $table->string('account_number');
            $table->string('ifsc_code');
            $table->string('bank_name');
            $table->string('bank_branch');
            
            // Verification status fields
            $table->tinyInteger('phone_verified_at')->default(0);
            $table->tinyInteger('email_verified_at')->default(0);
            $table->tinyInteger('aadhaar_verified_at')->default(0);
            $table->tinyInteger('pan_verified_at')->default(0);
            $table->tinyInteger('bank_verified_at')->default(0);
            
            // Status and tracking
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraints
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
            
            // Indexes for performance
            $table->index(['mid', 'status']);
            $table->index(['admin_id', 'status']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aeps_drafts');
    }
};
