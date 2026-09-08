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
        Schema::table('attendance', function (Blueprint $table) {
            $table->decimal('check_in_latitude', 10, 8)->nullable()->after('status');
            $table->decimal('check_in_longitude', 11, 8)->nullable()->after('check_in_latitude');
            $table->decimal('check_out_latitude', 10, 8)->nullable()->after('check_in_longitude');
            $table->decimal('check_out_longitude', 11, 8)->nullable()->after('check_out_latitude');
            $table->text('check_in_address')->nullable()->after('check_out_longitude');
            $table->text('check_out_address')->nullable()->after('check_in_address');
            $table->string('check_in_selfie')->nullable()->after('check_out_address');
            $table->string('check_out_selfie')->nullable()->after('check_in_selfie');
            $table->decimal('total_hours', 5, 2)->default(0)->after('check_out_selfie');
            $table->text('notes')->nullable()->after('total_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropColumn([
                'check_in_latitude',
                'check_in_longitude',
                'check_out_latitude',
                'check_out_longitude',
                'check_in_address',
                'check_out_address',
                'check_in_selfie',
                'check_out_selfie',
                'total_hours',
                'notes'
            ]);
        });
    }
};
