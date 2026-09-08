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
        Schema::create('email_threads', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->json('participants'); // Array of user IDs
            $table->unsignedBigInteger('last_email_id')->nullable(); // Will add foreign key constraint later
            $table->timestamp('last_activity_at');
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedBigInteger('admin_id')->nullable();
            
            $table->index('last_activity_at');
            $table->index('last_email_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_threads');
    }
};
