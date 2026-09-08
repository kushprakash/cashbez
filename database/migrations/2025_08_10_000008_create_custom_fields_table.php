<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('lead_type_id');
            $table->string('field_name', 100);
            $table->enum('field_type', ['text', 'number', 'date', 'dropdown']);
            $table->json('options')->nullable();
            $table->boolean('required')->default(false);
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
