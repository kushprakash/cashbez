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
        Schema::table('financial_members', function (Blueprint $table) {
            if (!Schema::hasColumn('financial_members', 'aadhar_verified')) {
                $table->boolean('aadhar_verified')->default(false)->after('aadhar_number');
            }
            if (!Schema::hasColumn('financial_members', 'account_number')) {
                $table->string('account_number', 50)->nullable()->after('aadhar_verified');
            }
            if (!Schema::hasColumn('financial_members', 'ifsc_code')) {
                $table->string('ifsc_code', 20)->nullable()->after('account_number');
            }
            if (!Schema::hasColumn('financial_members', 'bank_name')) {
                $table->string('bank_name', 150)->nullable()->after('ifsc_code');
            }
            if (!Schema::hasColumn('financial_members', 'bank_branch')) {
                $table->string('bank_branch', 150)->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('financial_members', 'account_holder_name')) {
                $table->string('account_holder_name', 150)->nullable()->after('bank_branch');
            }
            if (!Schema::hasColumn('financial_members', 'account_verified')) {
                $table->boolean('account_verified')->default(false)->after('account_holder_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_members', function (Blueprint $table) {
            $columns = [
                'aadhar_verified',
                'account_number',
                'ifsc_code',
                'bank_name',
                'bank_branch',
                'account_holder_name',
                'account_verified'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('financial_members', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
