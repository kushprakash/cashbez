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
        Schema::table('passbooks', function (Blueprint $table) {
            // Add transaction_id column
            $table->string('transaction_id', 100)->nullable()->after('account_id');
            
            // Rename details column to description
            $table->renameColumn('details', 'description');
            
            // Add index for transaction_id for better performance
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passbooks', function (Blueprint $table) {
            // Remove transaction_id column
            $table->dropIndex(['transaction_id']);
            $table->dropColumn('transaction_id');
            
            // Rename description back to details
            $table->renameColumn('description', 'details');
        });
    }
};
