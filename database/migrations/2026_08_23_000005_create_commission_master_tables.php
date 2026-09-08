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
        // 1. Commission Packages
        if (!Schema::hasTable('commission_packages')) {
            Schema::create('commission_packages', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->unsignedBigInteger('api_id')->nullable()->index(); // null = ALL APIs or default
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('api_id')->references('id')->on('api_settings')->onDelete('set null');
            });
        }

        // 2. Commission Package Items (per Category / Operator)
        if (!Schema::hasTable('commission_package_items')) {
            Schema::create('commission_package_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('package_id');
                $table->unsignedBigInteger('api_id')->nullable()->index();
                $table->string('category')->default('Prepaid')->index();
                $table->string('operator_code')->default('ALL')->index();
                $table->enum('commission_type', ['percentage', 'flat'])->default('percentage');
                $table->decimal('commission_val', 10, 2)->default(0.00);
                $table->timestamps();

                $table->foreign('package_id')->references('id')->on('commission_packages')->onDelete('cascade');
            });
        }

        // 3. Commission Package Assignments (to Roles or Users)
        if (!Schema::hasTable('commission_package_assignments')) {
            Schema::create('commission_package_assignments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('package_id');
                $table->enum('assign_type', ['role', 'user'])->default('role');
                $table->unsignedBigInteger('role_id')->nullable()->index();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('package_id')->references('id')->on('commission_packages')->onDelete('cascade');
            });
        }

        // 4. Special Offer Commissions
        if (!Schema::hasTable('special_offer_commissions')) {
            Schema::create('special_offer_commissions', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->unsignedBigInteger('api_id')->nullable()->index();
                $table->string('operator_code')->default('ALL')->index();
                $table->string('circle')->default('ALL')->index();
                $table->decimal('amount', 10, 2)->default(0.00)->index();
                $table->enum('commission_type', ['percentage', 'flat'])->default('percentage');
                $table->decimal('commission_val', 10, 2)->default(0.00);
                $table->enum('assign_type', ['all', 'role', 'user'])->default('all');
                $table->unsignedBigInteger('role_id')->nullable()->index();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('special_offer_commissions');
        Schema::dropIfExists('commission_package_assignments');
        Schema::dropIfExists('commission_package_items');
        Schema::dropIfExists('commission_packages');
    }
};
