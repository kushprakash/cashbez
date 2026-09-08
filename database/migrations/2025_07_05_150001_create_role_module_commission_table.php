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
        Schema::create('role_module_commission', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('main_module_id');
            $table->integer('user_id')->nullable();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('sub_module_id')->nullable();
            $table->unsignedBigInteger('commission_id');
            $table->tinyInteger('status')->default(1);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('main_module_id')->references('id')->on('main_modules')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
            $table->foreign('sub_module_id')->references('id')->on('sub_modules')->onDelete('cascade');
            $table->foreign('commission_id')->references('id')->on('module_commissions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_module_commission');
    }
};
