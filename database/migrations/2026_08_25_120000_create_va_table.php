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
        Schema::create('va', function (Blueprint $table) {
            $table->id();
            $table->string('mid')->nullable();
            $table->string('mobile')->nullable();
            $table->string('username')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_ifsc')->nullable();
            $table->string('virtual_account_id')->nullable();
            $table->string('virtual_account_number')->nullable();
            $table->string('virtual_ifsc')->nullable();
            $table->string('virtual_upi_handle')->nullable();
            $table->integer('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('va');
    }
};
