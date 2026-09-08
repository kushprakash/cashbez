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
        Schema::create('user_kyc', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            
            // Aadhaar verification data
            $table->string('aadhar_number')->nullable();
            $table->string('country')->nullable();
            $table->string('dist')->nullable();
            $table->string('house')->nullable();
            $table->string('landmark')->nullable();
            $table->string('pincode')->nullable();
            $table->string('po')->nullable();
            $table->string('state')->nullable();
            $table->string('street')->nullable();
            $table->string('subdist')->nullable();
            $table->string('vtc')->nullable();
            $table->date('dob')->nullable();
            $table->string('gender')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->string('name')->nullable();
            $table->longText('photo')->nullable();
            
            // PAN verification data
            $table->string('pan_number')->nullable();
            
            // Bank account verification data
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('branch')->nullable();
            
            // API response data
            $table->longText('response_aadhar')->nullable();
            $table->longText('response_pan')->nullable();
            $table->longText('response_account')->nullable();
            
            // Corporate KYC fields (for role = 2)
            $table->json('authorized_signatory')->nullable();
            $table->json('bank_details')->nullable();
            $table->json('business_details')->nullable();
            
            // Status tracking
            $table->boolean('aadhar_verified')->default(false);
            $table->boolean('pan_verified')->default(false);
            $table->boolean('account_verified')->default(false);
            $table->boolean('kyc_completed')->default(false);
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'kyc_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_kyc');
    }
};
