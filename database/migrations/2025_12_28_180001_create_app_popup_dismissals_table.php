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
        Schema::create('app_popup_dismissals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('popup_id');
            $table->datetime('dismissed_at');
            
            // Indexes
            $table->unique(['user_id', 'popup_id']);
            $table->index('popup_id');
            
            // Foreign key (optional, depends on your database setup)
            // $table->foreign('popup_id')->references('id')->on('app_popups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_popup_dismissals');
    }
};
