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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('mid')->unique();
            $table->string('mkey')->unique();
            $table->string('admin_mid');
            $table->string('mobile');
            $table->string('name');
            $table->string('email')->unique();
            $table->tinyInteger('email_verified_at')->default(0);
            $table->tinyInteger('aadhar_verified_at')->default(0);
            $table->string('password')->nullable();
            $table->string('aadhar_number')->nullable();
            $table->string('aadhar_data')->nullable();
            $table->string('role')->nullable();
            $table->longText('root')->nullable();
            $table->string('refer_by')->nullable();
            $table->tinyInteger('status')->default(1);
            $table->text('remember_token')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->longText('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
