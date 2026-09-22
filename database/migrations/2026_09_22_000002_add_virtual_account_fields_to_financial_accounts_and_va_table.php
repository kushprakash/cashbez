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
        // 1. Add virtual account & QR fields to financial_accounts
        if (Schema::hasTable('financial_accounts')) {
            Schema::table('financial_accounts', function (Blueprint $table) {
                if (!Schema::hasColumn('financial_accounts', 'virtual_account_id')) {
                    $table->string('virtual_account_id', 100)->nullable()->after('nominee_relation');
                }
                if (!Schema::hasColumn('financial_accounts', 'virtual_account_number')) {
                    $table->string('virtual_account_number', 100)->nullable()->after('virtual_account_id');
                }
                if (!Schema::hasColumn('financial_accounts', 'virtual_ifsc')) {
                    $table->string('virtual_ifsc', 50)->nullable()->after('virtual_account_number');
                }
                if (!Schema::hasColumn('financial_accounts', 'virtual_upi_handle')) {
                    $table->string('virtual_upi_handle', 150)->nullable()->after('virtual_ifsc');
                }
                if (!Schema::hasColumn('financial_accounts', 'qrcode_image')) {
                    $table->longText('qrcode_image')->nullable()->after('virtual_upi_handle');
                }
                if (!Schema::hasColumn('financial_accounts', 'qrcode_pdf')) {
                    $table->longText('qrcode_pdf')->nullable()->after('qrcode_image');
                }
            });
        }

        // 2. Add member tracking fields to va table
        if (Schema::hasTable('va')) {
            Schema::table('va', function (Blueprint $table) {
                if (!Schema::hasColumn('va', 'user_type')) {
                    $table->string('user_type', 20)->default('AGENT')->after('virtual_upi_handle');
                }
                if (!Schema::hasColumn('va', 'member_id')) {
                    $table->unsignedBigInteger('member_id')->nullable()->after('user_type');
                }
                if (!Schema::hasColumn('va', 'financial_account_id')) {
                    $table->unsignedBigInteger('financial_account_id')->nullable()->after('member_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('financial_accounts')) {
            Schema::table('financial_accounts', function (Blueprint $table) {
                $cols = ['virtual_account_id', 'virtual_account_number', 'virtual_ifsc', 'virtual_upi_handle', 'qrcode_image', 'qrcode_pdf'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('financial_accounts', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if (Schema::hasTable('va')) {
            Schema::table('va', function (Blueprint $table) {
                $cols = ['user_type', 'member_id', 'financial_account_id'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('va', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
