<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('followups', function (Blueprint $table) {
            $table->unsignedBigInteger('lead_status_id')->nullable()->after('followup_status_id');
            $table->foreign('lead_status_id')->references('id')->on('lead_status')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('followups', function (Blueprint $table) {
            $table->dropForeign(['lead_status_id']);
            $table->dropColumn('lead_status_id');
        });
    }
};
