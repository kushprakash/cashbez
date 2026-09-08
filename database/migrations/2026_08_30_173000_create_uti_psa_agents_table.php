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
        Schema::create('uti_psa_agents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('agent_id')->nullable(); // e.g. ANNECHM-816
            $table->string('name');
            $table->string('contact_person');
            $table->string('email');
            $table->string('mobile_no');
            $table->string('pin');
            $table->string('location');
            $table->string('state');
            $table->string('district');
            $table->string('pan_no');
            $table->text('address_1');
            $table->text('address_2')->nullable();
            $table->text('address_3')->nullable();
            $table->text('address_4')->nullable();
            $table->tinyInteger('status')->default(0); // 0=Pending, 1=Approved, 2=Rejected
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
        Schema::dropIfExists('uti_psa_agents');
    }
};
