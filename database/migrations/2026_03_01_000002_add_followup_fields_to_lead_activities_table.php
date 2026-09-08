<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lead_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('followup_type_id')->nullable()->after('next_followup');
            $table->unsignedBigInteger('followup_status_id')->nullable()->after('followup_type_id');
            $table->unsignedBigInteger('lead_status_id')->nullable()->after('followup_status_id');
            $table->time('followup_time')->nullable()->after('lead_status_id');
            $table->text('followup_notes')->nullable()->after('followup_time');

            $table->foreign('followup_type_id')->references('id')->on('followup_types')->onDelete('set null');
            $table->foreign('followup_status_id')->references('id')->on('followup_statuses')->onDelete('set null');
            $table->foreign('lead_status_id')->references('id')->on('lead_status')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('lead_activities', function (Blueprint $table) {
            $table->dropForeign(['followup_type_id']);
            $table->dropForeign(['followup_status_id']);
            $table->dropForeign(['lead_status_id']);
            $table->dropColumn(['followup_type_id', 'followup_status_id', 'lead_status_id', 'followup_time', 'followup_notes']);
        });
    }
};
