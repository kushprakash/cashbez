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
        Schema::table('followups', function (Blueprint $table) {
            // Add new foreign key columns
            $table->unsignedBigInteger('followup_type_id')->nullable()->after('followup_time');
            $table->unsignedBigInteger('followup_status_id')->nullable()->after('followup_type_id');
            
            // Add foreign key constraints
            $table->foreign('followup_type_id')->references('id')->on('followup_types')->onDelete('set null');
            $table->foreign('followup_status_id')->references('id')->on('followup_statuses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('followups', function (Blueprint $table) {
            $table->dropForeign(['followup_type_id']);
            $table->dropForeign(['followup_status_id']);
            $table->dropColumn(['followup_type_id', 'followup_status_id']);
        });
    }
};
