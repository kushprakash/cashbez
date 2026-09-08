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
        // Add foreign key constraint from email_threads to emails
        Schema::table('email_threads', function (Blueprint $table) {
            $table->foreign('last_email_id')->references('id')->on('emails')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraint
        Schema::table('email_threads', function (Blueprint $table) {
            $table->dropForeign(['last_email_id']);
        });
    }
};
