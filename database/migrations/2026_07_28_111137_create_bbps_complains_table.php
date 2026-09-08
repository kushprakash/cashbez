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
        Schema::create('bbps_complain', function (Blueprint $table) {
            $table->id();
            $table->string('bbps_transaction_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('mobile')->nullable();
            $table->text('customer_remark')->nullable();
            $table->text('admin_remark')->nullable();
            $table->string('status')->default('UNRESOLVED');
            $table->date('creation_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bbps_complain');
    }
};
