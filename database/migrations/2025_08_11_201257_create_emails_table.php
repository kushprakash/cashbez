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
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->longText('body');
            $table->boolean('is_draft')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('reply_to_id')->nullable()->constrained('emails')->onDelete('set null');
            $table->foreignId('thread_id')->nullable()->constrained('email_threads')->onDelete('set null');
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
            $table->boolean('has_attachments')->default(false);
            $table->json('cc')->nullable(); // Array of email addresses
            $table->json('bcc')->nullable(); // Array of email addresses
            $table->enum('email_type', ['internal', 'external'])->default('internal');
            $table->softDeletes();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedBigInteger('admin_id')->nullable();
            
            $table->index(['sender_id', 'created_at']);
            $table->index(['thread_id', 'created_at']);
            $table->index(['is_draft', 'sender_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
