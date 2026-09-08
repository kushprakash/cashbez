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
        Schema::table('salary_payments', function (Blueprint $table) {
            // Add columns if they don't exist
            if (!Schema::hasColumn('salary_payments', 'company_bank')) {
                $table->string('company_bank', 100)->nullable()->after('status');
            }
            if (!Schema::hasColumn('salary_payments', 'transaction_mode')) {
                $table->enum('transaction_mode', ['cash', 'cheque', 'online'])->nullable()->after('company_bank');
            }
            if (!Schema::hasColumn('salary_payments', 'cheque_no')) {
                $table->string('cheque_no', 50)->nullable()->after('transaction_mode');
            }
            if (!Schema::hasColumn('salary_payments', 'utr')) {
                $table->string('utr', 100)->nullable()->after('cheque_no');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_payments', function (Blueprint $table) {
            $table->dropColumn(['company_bank', 'transaction_mode', 'cheque_no', 'utr']);
        });
    }
};
