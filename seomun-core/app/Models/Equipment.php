<?php

namespace App\Models;

use App\Enums\MachineType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use SoftDeletes;

    protected $table = 'equipments';

    protected $fillable = [
        'company_name',
        'name',
        'machine_type',
        'maintenance_company',
        'manager_name',
        'manager_phone',
        'introduced_at',
        'image',
        'work_process',
        'status',
        'notes',
    ];

    protected $casts = [
        'introduced_at' => 'date',
        'machine_type'  => MachineType::class,
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(EquipmentLog::class);
    }
}
