<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('salary_payment_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('month');
            $table->integer('year');
            $table->json('earnings');
            $table->json('deductions');
            $table->decimal('net', 10, 2);
            $table->string('pdf_path')->nullable();
            $table->timestamps();
            $table->foreign('salary_payment_id')->references('id')->on('salary_payments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    public function down() {
        Schema::dropIfExists('payslips');
    }
};
