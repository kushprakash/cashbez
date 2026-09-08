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
        Schema::create('loan_leads', function (Blueprint $table) {
            $table->id();
            $table->string('lead_id')->unique();
            $table->unsignedBigInteger('user_id');
            $table->enum('loan_type', ['personal', 'business']);
            
            // Basic Information
            $table->string('full_name');
            $table->string('mobile', 20);
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->string('pan', 10)->nullable();
            
            // Personal Loan Fields
            $table->enum('employment_type', ['salaried', 'self_employed', 'business', 'professional'])->nullable();
            $table->decimal('monthly_income', 12, 2)->nullable();
            $table->string('company_name')->nullable();
            $table->string('job_title')->nullable();
            $table->integer('work_experience')->nullable();
            
            // Business Loan Fields
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_category')->nullable();
            $table->string('business_registration_number')->nullable();
            $table->string('gst_number')->nullable();
            $table->integer('business_vintage')->nullable();
            $table->decimal('annual_turnover', 15, 2)->nullable();
            $table->decimal('monthly_profit', 12, 2)->nullable();
            $table->text('business_address')->nullable();
            $table->string('business_city')->nullable();
            $table->string('business_state')->nullable();
            $table->string('business_pincode', 10)->nullable();
            
            // Common Loan Fields
            $table->decimal('loan_amount', 12, 2);
            $table->string('loan_purpose')->nullable();
            $table->integer('loan_tenure')->nullable();
            $table->boolean('existing_loans')->default(false);
            $table->decimal('existing_loan_amount', 12, 2)->nullable();
            $table->integer('credit_score')->nullable();
            
            // Personal/Residential Address
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode', 10)->nullable();
            
            // Additional Fields
            $table->integer('bank_statements_months')->nullable();
            $table->boolean('collateral_available')->default(false);
            $table->string('collateral_type')->nullable();
            $table->decimal('collateral_value', 15, 2)->nullable();
            $table->string('lead_source')->nullable();
            $table->string('preferred_contact_time')->nullable();
            $table->boolean('consent')->default(true);
            $table->timestamp('consent_timestamp')->nullable();
            
            // Status and Assignment
            $table->enum('status', [
                'new', 
                'contacted', 
                'document_pending', 
                'under_review', 
                'processing', 
                'approved', 
                'disbursed', 
                'rejected', 
                'cancelled'
            ])->default('new');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('status_message')->nullable();
            
            // Commission Fields
            $table->decimal('commission_amount', 10, 2)->nullable();
            $table->enum('commission_status', ['pending', 'approved', 'released', 'cancelled'])->nullable();
            $table->timestamp('commission_released_at')->nullable();
            $table->unsignedBigInteger('commission_released_by')->nullable();
            $table->timestamp('commission_set_at')->nullable();
            $table->unsignedBigInteger('commission_set_by')->nullable();
            
            // Approval Fields
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->integer('approved_tenure')->nullable();
            $table->decimal('approved_interest_rate', 5, 2)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('documents_submitted')->default(false);
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->nullable();
            $table->date('disbursement_date')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('commission_released_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('commission_set_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['loan_type', 'status']);
            $table->index(['assigned_to']);
            $table->index(['commission_status']);
            $table->index(['created_at']);
            $table->index(['mobile']);
            $table->index(['email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_leads');
    }
};