<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleCommission extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'main_module_id',
        'module_id',
        'sub_module_id',
        'mode',
        'from_amt',
        'to_amt',
        'commission_type',
        'commission',
        'txn_type',
        'status',
    ];
    public function mainModule() { return $this->belongsTo(MainModule::class, 'main_module_id'); }
    public function module() { return $this->belongsTo(Module::class); }
    public function subModule() { return $this->belongsTo(SubModule::class, 'sub_module_id'); }
    public function commission() { return $this->belongsTo(ModuleCommission::class, 'commission_id');}
}
