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
        Schema::create('subscription_masters', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('user_id');
            $table->unsignedBigInteger('main_module_id');
            $table->integer('module_id');
            $table->integer('duration');
            $table->string('duration_type', 111);
            $table->text('description');
            $table->float('price');
            $table->integer('status');
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('main_module_id')->references('id')->on('main_modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_masters');
    }
};
