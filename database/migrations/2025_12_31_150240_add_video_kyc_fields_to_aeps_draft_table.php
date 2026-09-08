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
        Schema::table('aeps_drafts', function (Blueprint $table) {
            $table->string('shop_inner', 500)->nullable()->after('shop_name');
            $table->string('shop_outer', 500)->nullable()->after('shop_inner');
            $table->string('video_url', 500)->nullable()->after('shop_outer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aeps_drafts', function (Blueprint $table) {
            $table->dropColumn(['shop_inner', 'shop_outer', 'video_url']);
        });
    }
};
