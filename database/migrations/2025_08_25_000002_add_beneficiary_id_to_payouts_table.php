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
        Schema::table('payouts', function (Blueprint $table) {
            $table->unsignedBigInteger('beneficiary_id')->nullable()->after('user_id');
            
            // Add foreign key constraint
            $table->foreign('beneficiary_id')->references('id')->on('beneficiaries')->onDelete('set null');
            
            // Add index for better performance
            $table->index('beneficiary_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payouts', function (Blueprint $table) {
            $table->dropForeign(['beneficiary_id']);
            $table->dropIndex(['beneficiary_id']);
            $table->dropColumn('beneficiary_id');
        });
    }
};
