<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_members', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->unique(); // e.g. MEM-2026-000001
            $table->unsignedBigInteger('user_id'); // Agent / User who created/owns this member
            $table->unsignedBigInteger('admin_id'); // Tenant Admin
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->string('name');
            $table->string('father_name')->nullable();
            $table->string('husband_name')->nullable();
            $table->date('dob')->nullable();
            $table->string('gender')->default('male');
            $table->string('mobile', 15);
            $table->string('email')->nullable();

            $table->text('address')->nullable();
            $table->string('state')->nullable();
            $table->string('district')->nullable();
            $table->string('pincode', 10)->nullable();
            $table->string('occupation')->nullable();

            $table->string('photo')->nullable();
            $table->string('signature')->nullable();

            $table->unsignedBigInteger('membership_plan_id')->nullable();
            $table->decimal('membership_fee', 18, 2)->default(0.00);

            $table->string('nominee_name')->nullable();
            $table->string('nominee_relation')->nullable();
            $table->string('nominee_mobile')->nullable();

            $table->string('status')->default('ACTIVE'); // ACTIVE, INACTIVE, BLOCKED
            $table->string('kyc_status')->default('PENDING'); // PENDING, SUBMITTED, APPROVED, REJECTED

            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
            $table->index('mobile');
            $table->index('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_members');
    }
};
