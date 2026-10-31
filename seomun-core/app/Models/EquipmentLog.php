<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentLog extends Model
{
    protected $table = 'equipment_logs';

    protected $fillable = [
        'equipment_id',
        'log_date',
        'maintenance_details',
        'special_notes',
        'cost_type',
        'manager',
    ];

    protected $casts = [
        'log_date' => 'date',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
