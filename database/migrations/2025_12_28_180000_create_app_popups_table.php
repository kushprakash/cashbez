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
        Schema::create('app_popups', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->string('image_url')->nullable();
            $table->enum('image_position', ['top', 'center', 'background'])->default('center');
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();
            $table->text('target_users')->nullable()->comment('Comma-separated user IDs');
            $table->text('target_roles')->nullable()->comment('Comma-separated role IDs');
            $table->enum('popup_type', ['general', 'offer', 'renewal_reminder', 'announcement'])->default('general');
            $table->enum('show_on_screen', ['home', 'login', 'both'])->default('both');
            $table->text('custom_routes')->nullable()->comment('Comma-separated custom route names');
            $table->datetime('display_start')->nullable();
            $table->datetime('display_end')->nullable();
            $table->integer('show_after_seconds')->default(0);
            $table->integer('auto_close_seconds')->default(5);
            $table->boolean('is_repeatable')->default(false);
            $table->integer('priority')->default(10)->comment('Lower number = higher priority');
            $table->enum('display_frequency', ['once', 'once_per_day', 'always'])->default('once');
            $table->boolean('is_dismissible')->default(true);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('show_on_screen');
            $table->index('priority');
            $table->index(['display_start', 'display_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_popups');
    }
};
