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
        // Add additional indexes for performance
        Schema::table('users', function (Blueprint $table) {
            $table->index('mobile');
            $table->index('status');
            $table->index('role');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->index('status');
            $table->index('user_id');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('sub_modules', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('module_permissions', function (Blueprint $table) {
            $table->index('status');
            $table->index(['module_id', 'sub_module_id']);
        });

        Schema::table('module_commissions', function (Blueprint $table) {
            $table->index('status');
            $table->index('user_id');
            $table->index(['module_id', 'sub_module_id']);
            $table->index(['from_amt', 'to_amt']);
        });

        Schema::table('role_module_permissions', function (Blueprint $table) {
            $table->index('status');
            $table->index('user_id');
            $table->index(['role_id', 'module_id']);
        });

        Schema::table('role_module_commission', function (Blueprint $table) {
            $table->index('status');
            $table->index('user_id');
            $table->index(['role_id', 'module_id']);
        });

        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->index('status');
            $table->index(['user_id', 'role_id']);
            $table->index(['module_id', 'sub_module_id']);
        });

        Schema::table('user_role_commissions', function (Blueprint $table) {
            $table->index('status');
            $table->index(['user_id', 'role_id']);
            $table->index(['module_id', 'sub_module_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('module_id');
            $table->index('status');
            $table->index(['start_at', 'end_at']);
        });

        Schema::table('subscription_masters', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('module_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['mobile']);
            $table->dropIndex(['status']);
            $table->dropIndex(['role']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('sub_modules', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('module_permissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['module_id', 'sub_module_id']);
        });

        Schema::table('module_commissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['module_id', 'sub_module_id']);
            $table->dropIndex(['from_amt', 'to_amt']);
        });

        Schema::table('role_module_permissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['role_id', 'module_id']);
        });

        Schema::table('role_module_commission', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['role_id', 'module_id']);
        });

        Schema::table('user_role_permissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'role_id']);
            $table->dropIndex(['module_id', 'sub_module_id']);
        });

        Schema::table('user_role_commissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'role_id']);
            $table->dropIndex(['module_id', 'sub_module_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['module_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['start_at', 'end_at']);
        });

        Schema::table('subscription_masters', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['module_id']);
            $table->dropIndex(['status']);
        });
    }
};
