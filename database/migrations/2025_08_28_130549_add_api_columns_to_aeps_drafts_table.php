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
        Schema::table('aeps_drafts', function (Blueprint $table) {
            $table->json('request_data')->nullable()->after('admin_id');
            $table->json('response_data')->nullable()->after('request_data');
            $table->integer('aeps_status')->default(0)->after('response_data');
            $table->string('generated_hash')->nullable()->after('aeps_status');
            $table->string('user_name')->nullable()->after('generated_hash');
            $table->string('password')->nullable()->after('user_name');
            $table->string('ip_address')->nullable()->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aeps_drafts', function (Blueprint $table) {
            $table->dropColumn([
                'request_data',
                'response_data',
                'aeps_status',
                'generated_hash',
                'user_name',
                'password',
                'ip_address'
            ]);
        });
    }
};
