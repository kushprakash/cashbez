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
        Schema::create('loan_lead_history', function (Blueprint $table) {
            $table->id();
            $table->string('lead_id');
            $table->string('old_status')->nullable();
            $table->string('new_status');
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->integer('changed_by_role')->nullable();
            $table->text('remarks')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            // Foreign key constraints
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index(['lead_id']);
            $table->index(['changed_by']);
            $table->index(['created_at']);
            $table->index(['old_status', 'new_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_lead_history');
    }
};