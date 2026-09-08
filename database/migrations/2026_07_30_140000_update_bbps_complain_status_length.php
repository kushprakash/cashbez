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
        try {
            DB::statement("ALTER TABLE bbps_complain MODIFY status VARCHAR(50) NULL DEFAULT 'UNRESOLVED';");
            DB::statement("ALTER TABLE bbps_complain MODIFY bbps_transaction_id VARCHAR(255) NULL;");
        } catch (\Exception $e) {
            // Ignore if column already modified
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
