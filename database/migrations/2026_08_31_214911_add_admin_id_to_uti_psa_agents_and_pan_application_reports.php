<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Note: admin_id already exists in uti_psa_agents, only adding to pan_application_reports
     */
    public function up(): void
    {
        // Add admin_id to pan_application_reports only
        Schema::table('pan_application_reports', function (Blueprint $table) {
            $table->unsignedBigInteger('admin_id')->nullable()->after('imported_by');
            $table->index('admin_id', 'idx_pan_app_reports_admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pan_application_reports', function (Blueprint $table) {
            $table->dropIndex('idx_pan_app_reports_admin_id');
            $table->dropColumn('admin_id');
        });
    }
};
