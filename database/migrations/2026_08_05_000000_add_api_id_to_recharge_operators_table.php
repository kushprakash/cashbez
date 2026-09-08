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
        Schema::table('recharge_operators', function (Blueprint $table) {
            $table->unsignedBigInteger('api_id')->nullable()->after('operator_code');
            $table->foreign('api_id')->references('id')->on('api_settings')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recharge_operators', function (Blueprint $table) {
            $table->dropForeign(['api_id']);
            $table->dropColumn('api_id');
        });
    }
};
