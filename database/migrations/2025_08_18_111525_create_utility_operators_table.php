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
        Schema::create('utility_operators', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50); // Electric, DTH, etc.
            $table->string('state', 100)->nullable();
            $table->string('code', 50);
            $table->string('name', 200);
            $table->string('category', 100);
            $table->string('label', 200)->nullable();
            $table->string('icon', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['type', 'code', 'category']);
            $table->index(['type', 'category']);
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_operators');
    }
};
