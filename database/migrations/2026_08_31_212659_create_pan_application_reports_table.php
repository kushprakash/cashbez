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
        Schema::create('pan_application_reports', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable();           // UserId from Excel (e.g. ANNECHM-577) = uti_psa_agents.agent_id
            $table->string('vle_id')->nullable();             // VleId
            $table->string('form_type')->nullable();          // FormType (F49, F49A etc.)
            $table->string('application_no')->unique();      // ApplicationNo - unique key for dedup
            $table->string('pan_card_mode')->nullable();      // PanCardMode
            $table->string('pan_app_mode')->nullable();       // PanAppMode
            $table->string('dispatch_address')->nullable();   // Dispatch Address
            $table->string('pan_name')->nullable();           // pan Name
            $table->string('lot_no')->nullable();             // LotNo
            $table->date('lot_date')->nullable();             // LotDate
            $table->date('doa')->nullable();                  // DOA (Date of Application)
            $table->string('application_status')->nullable(); // ApplicationStatus
            $table->string('objection_code')->nullable();     // ObjectionCode
            $table->string('objection_code1')->nullable();    // ObjectionCode1
            $table->string('objection_code2')->nullable();    // ObjectionCode2
            $table->unsignedBigInteger('imported_by')->nullable(); // Admin who imported
            $table->timestamps();

            $table->index('user_id');
            $table->index('lot_date');
            $table->index('doa');
            $table->index('application_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pan_application_reports');
    }
};
