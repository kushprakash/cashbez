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
        // Add main_module_id to modules table if not exists
        if (!Schema::hasColumn('modules', 'main_module_id')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->unsignedBigInteger('main_module_id')->after('id');
                $table->foreign('main_module_id')->references('id')->on('main_modules')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['main_module_id']);
            $table->dropColumn('main_module_id');
        });
    }
};
