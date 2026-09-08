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
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'va_create_charge')) {
                $table->float('va_create_charge')->default(0.00)->after('min_balance');
            }
            if (!Schema::hasColumn('settings', 'va_receive_charge')) {
                $table->float('va_receive_charge')->default(0.00)->after('va_create_charge');
            }
            if (!Schema::hasColumn('settings', 'api_vpa_receive_charge')) {
                $table->float('api_vpa_receive_charge')->default(0.00)->after('va_receive_charge');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('settings', 'va_create_charge')) $columns[] = 'va_create_charge';
            if (Schema::hasColumn('settings', 'va_receive_charge')) $columns[] = 'va_receive_charge';
            if (Schema::hasColumn('settings', 'api_vpa_receive_charge')) $columns[] = 'api_vpa_receive_charge';
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
