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
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name');
            $table->string('account');
            $table->string('ifsc');
            $table->string('branch')->nullable();
            $table->unsignedBigInteger('admin_id');
            $table->unsignedBigInteger('created_by');
            $table->boolean('account_verified')->default(false);
            $table->boolean('ifsc_verified')->default(false);
            $table->text('verification_data')->nullable(); // Store verification API response
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes for performance
            $table->index(['user_id', 'deleted_at']);
            $table->index(['admin_id', 'deleted_at']);
            $table->index(['account', 'ifsc']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
