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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('company_name');
            $table->string('logo')->nullable();
            $table->string('footer_logo')->nullable();
            $table->string('favicon')->nullable();
            $table->text('about')->nullable();
            $table->string('copy_right')->nullable();
            $table->text('address')->nullable();
            $table->string('email');
            $table->string('website')->nullable();
            $table->string('whatsapp_no')->nullable();
            $table->string('mobile_no');
            $table->string('landline_no')->nullable();
            $table->text('map_url')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('theme_color_primary')->default('#007bff');
            $table->string('theme_color_secondary')->default('#6c757d');
            $table->string('currency_code')->default('USD');
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
