<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_otps', function (Blueprint $table) {
            $table->id();
            $table->string('mobile', 15);
            $table->string('otp', 10);
            $table->string('purpose')->default('WITHDRAWAL'); // WITHDRAWAL, ACCOUNT_CLOSE
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('member_id')->nullable();
            $table->boolean('is_used')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['mobile', 'purpose', 'is_used']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_otps');
    }
};
