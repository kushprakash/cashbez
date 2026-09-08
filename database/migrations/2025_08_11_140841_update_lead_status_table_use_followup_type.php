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
        Schema::table('lead_status', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['lead_type_id']);
            
            // Rename the column
            $table->renameColumn('lead_type_id', 'followup_type_id');
        });
        
        // Add the new foreign key constraint in a separate statement
        Schema::table('lead_status', function (Blueprint $table) {
            $table->foreign('followup_type_id')->references('id')->on('followup_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lead_status', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['followup_type_id']);
            
            // Rename the column back
            $table->renameColumn('followup_type_id', 'lead_type_id');
        });
        
        // Add the old foreign key constraint back
        Schema::table('lead_status', function (Blueprint $table) {
            $table->foreign('lead_type_id')->references('id')->on('lead_types')->onDelete('set null');
        });
    }
};
