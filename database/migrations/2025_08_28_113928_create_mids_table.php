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
        Schema::create('mids', function (Blueprint $table) {
            $table->id();
            $table->string('mid')->unique();
            $table->tinyInteger('status')->default(0)->comment('0 = not used, 1 = used');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mids');
    }
};
