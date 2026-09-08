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
        Schema::create('pan_fund_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('account_id')->nullable(); // Utility wallet account ID
            $table->string('txn_id')->unique();
            $table->integer('coupon_qty')->default(1);
            $table->decimal('amount', 10, 2);
            $table->tinyInteger('status')->default(0); // 0=Pending, 1=Approved, 2=Rejected
            $table->text('remark')->nullable();
            $table->text('admin_remark')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pan_fund_requests');
    }
};
