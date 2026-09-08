<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PanApplicationReport extends Model
{
    protected $table = 'pan_application_reports';

    protected $fillable = [
        'user_id',
        'vle_id',
        'form_type',
        'application_no',
        'pan_card_mode',
        'pan_app_mode',
        'dispatch_address',
        'pan_name',
        'lot_no',
        'lot_date',
        'doa',
        'application_status',
        'objection_code',
        'objection_code1',
        'objection_code2',
        'imported_by',
        'admin_id',
    ];

    protected $casts = [
        'lot_date' => 'date',
        'doa'      => 'date',
    ];

    /**
     * The User who owns this record (pan_application_reports.user_id → users.id)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * The UTI PSA Agent linked via vle_id (=uti_psa_agents.agent_id)
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(UtiPsaAgent::class, 'vle_id', 'agent_id');
    }

    /**
     * Admin who imported this record
     */
    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'imported_by');
    }

    /**
     * Admin linked via admin_id
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'admin_id');
    }
}
