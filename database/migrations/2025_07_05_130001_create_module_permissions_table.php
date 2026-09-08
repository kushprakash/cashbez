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
        Schema::create('module_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('main_module_id');
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('sub_module_id')->nullable();
            $table->string('name', 100);
            $table->string('endpoint');
            $table->string('route', 111)->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();

            $table->foreign('main_module_id')->references('id')->on('main_modules')->onDelete('cascade');
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
            $table->foreign('sub_module_id')->references('id')->on('sub_modules')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_permissions');
    }
};
