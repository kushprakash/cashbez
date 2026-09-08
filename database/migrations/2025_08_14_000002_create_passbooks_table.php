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
        Schema::create('passbooks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('account_id');
            $table->text('details');
            $table->enum('type', ['CR', 'DR']); // CR=Credit, DR=Debit
            $table->decimal('pre_balance', 15, 2)->default(0.00);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance', 15, 2);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('admin_id');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['user_id', 'account_id']);
            $table->index(['account_id', 'created_at']);
            $table->index(['admin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passbooks');
    }
};
