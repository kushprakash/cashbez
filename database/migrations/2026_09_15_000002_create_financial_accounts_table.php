<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_number')->unique(); // e.g. SB-2026-000001, DD-2026-000001
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('user_id'); // Agent
            $table->unsignedBigInteger('admin_id'); // Tenant Admin
            $table->unsignedBigInteger('created_by')->nullable();

            $table->string('service_type'); // SAVING, DD, RD, FD, MIS
            $table->unsignedBigInteger('plan_id')->nullable();

            $table->decimal('current_balance', 18, 2)->default(0.00);
            $table->decimal('available_balance', 18, 2)->default(0.00);
            $table->decimal('opening_amount', 18, 2)->default(0.00);
            $table->decimal('interest_rate', 8, 2)->default(0.00);
            $table->integer('duration_months')->nullable();

            $table->string('status')->default('ACTIVE'); // ACTIVE, PENDING_APPROVAL, CLOSED, MATURED

            $table->string('nominee_name')->nullable();
            $table->string('nominee_relation')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
            $table->index(['member_id', 'service_type']);
            $table->index('account_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_accounts');
    }
};
