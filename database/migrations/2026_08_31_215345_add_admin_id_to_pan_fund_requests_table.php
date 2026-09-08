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
        Schema::table('pan_fund_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('admin_id')->nullable()->after('user_id');
            $table->index('admin_id', 'idx_pan_fund_requests_admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pan_fund_requests', function (Blueprint $table) {
            $table->dropIndex('idx_pan_fund_requests_admin_id');
            $table->dropColumn('admin_id');
        });
    }
};
