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
        Schema::create('email_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('recipient_type', ['to', 'cc', 'bcc'])->default('to');
            $table->enum('folder_type', ['inbox', 'sent', 'drafts', 'trash', 'archive'])->default('inbox');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_starred')->default(false);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedBigInteger('admin_id')->nullable();
            
            $table->unique(['email_id', 'user_id', 'recipient_type']);
            $table->index(['user_id', 'folder_type', 'is_deleted']);
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'is_starred']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_recipients');
    }
};
