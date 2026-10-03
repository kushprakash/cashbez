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
        if (Schema::hasTable('beneficiaries') && !Schema::hasColumn('beneficiaries', 'bank')) {
            Schema::table('beneficiaries', function (Blueprint $table) {
                $table->string('bank')->nullable()->after('branch');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('beneficiaries') && Schema::hasColumn('beneficiaries', 'bank')) {
            Schema::table('beneficiaries', function (Blueprint $table) {
                $table->dropColumn('bank');
            });
        }
    }
};
