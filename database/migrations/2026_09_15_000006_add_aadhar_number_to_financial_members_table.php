<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('financial_members', 'aadhar_number')) {
            Schema::table('financial_members', function (Blueprint $table) {
                $table->string('aadhar_number', 20)->nullable()->after('mobile');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('financial_members', 'aadhar_number')) {
            Schema::table('financial_members', function (Blueprint $table) {
                $table->dropColumn('aadhar_number');
            });
        }
    }
};
