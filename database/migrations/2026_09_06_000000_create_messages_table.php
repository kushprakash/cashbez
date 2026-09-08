<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->id();
                $table->string('name')->index();
                $table->unsignedBigInteger('user_id')->default(1)->index();
                $table->text('message');
                $table->string('template_id')->nullable();
                $table->timestamps();
            });

            // Insert default OTP and joining message templates
            DB::table('messages')->insert([
                [
                    'name' => 'VerificationOTP',
                    'user_id' => 1,
                    'message' => 'Your OTP for verification is $otp.',
                    'template_id' => '1207161536281928374',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'joining',
                    'user_id' => 1,
                    'message' => 'Welcome $name! Your account has been registered with MID: $mid.',
                    'template_id' => '1207161536281928375',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
