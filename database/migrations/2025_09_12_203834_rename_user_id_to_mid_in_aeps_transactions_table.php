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
        Schema::table('aeps_transactions', function (Blueprint $table) {
            $table->renameColumn('user_id', 'mid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aeps_transactions', function (Blueprint $table) {
            $table->renameColumn('mid', 'user_id');
        });
    }
};
