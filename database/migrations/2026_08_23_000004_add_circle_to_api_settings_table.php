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
        if (Schema::hasTable('api_settings') && !Schema::hasColumn('api_settings', 'circle')) {
            Schema::table('api_settings', function (Blueprint $table) {
                $table->string('circle', 100)->nullable()->default('ALL')->after('services');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('api_settings') && Schema::hasColumn('api_settings', 'circle')) {
            Schema::table('api_settings', function (Blueprint $table) {
                $table->dropColumn('circle');
            });
        }
    }
};
