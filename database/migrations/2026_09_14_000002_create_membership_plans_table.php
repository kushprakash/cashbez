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
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('admin_id')->index();

            $table->string('membership_type')->default('ORDINARY');
            $table->string('membership_code')->unique();
            $table->string('membership_name');
            $table->decimal('membership_fee', 18, 2)->default(0.00);
            $table->boolean('gst_applicable')->default(false);
            $table->decimal('gst_percentage', 5, 2)->default(0.00);
            $table->decimal('total_fee', 18, 2)->default(0.00);
            
            $table->integer('validity')->default(1);
            $table->string('validity_unit')->default('YEARS'); // DAYS, MONTHS, YEARS, LIFETIME
            
            $table->boolean('renewal_required')->default(true);
            $table->decimal('renewal_fee', 18, 2)->default(0.00);
            $table->integer('renewal_period')->default(1); // unit matches validity_unit or months
            $table->decimal('late_renewal_fee', 18, 2)->default(0.00);

            $table->string('status')->default('ACTIVE'); // ACTIVE, INACTIVE
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};
