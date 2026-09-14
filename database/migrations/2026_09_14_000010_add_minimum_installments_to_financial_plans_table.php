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
        if (Schema::hasTable('financial_plans') && !Schema::hasColumn('financial_plans', 'minimum_installments')) {
            Schema::table('financial_plans', function (Blueprint $table) {
                $table->integer('minimum_installments')->default(10)->after('installment_frequency');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('financial_plans') && Schema::hasColumn('financial_plans', 'minimum_installments')) {
            Schema::table('financial_plans', function (Blueprint $table) {
                $table->dropColumn('minimum_installments');
            });
        }
    }
};
