<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('month');
            $table->integer('year');
            $table->integer('total_days');
            $table->integer('payable_days');
            $table->decimal('gross', 10, 2);
            $table->decimal('deductions', 10, 2);
            $table->decimal('net', 10, 2);
            $table->string('status')->default('pending'); // pending, paid
            $table->string('company_bank', 100)->nullable();
            $table->enum('transaction_mode', ['cash', 'cheque', 'online'])->nullable();
            $table->string('cheque_no', 50)->nullable();
            $table->string('utr', 100)->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    public function down() {
        Schema::dropIfExists('salary_payments');
    }
};
