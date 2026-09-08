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
        Schema::table('followups', function (Blueprint $table) {
            $table->enum('followup_type', ['Call', 'Meeting', 'Email', 'Demo', 'Proposal'])->default('Call')->after('followup_date');
            $table->enum('followup_status', [
                'connected', 
                'positive', 
                'interested', 
                'not_reachable', 
                'busy', 
                'callback_requested', 
                'not_interested', 
                'wrong_number', 
                'meeting_scheduled', 
                'proposal_sent', 
                'follow_up_later'
            ])->nullable()->after('followup_type');
            $table->time('followup_time')->nullable()->after('followup_date');
            $table->boolean('is_completed')->default(false)->after('followup_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('followups', function (Blueprint $table) {
            $table->dropColumn(['followup_type', 'followup_status', 'followup_time', 'is_completed']);
        });
    }
};
