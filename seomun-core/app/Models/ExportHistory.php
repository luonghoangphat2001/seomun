<?php

namespace App\Models;

use App\Enums\ExcelHistoryStatus;
use Illuminate\Database\Eloquent\Model;

class ExportHistory extends Model
{
    protected $fillable = [
        'user_id',
        'module',
        'file_name',
        'file_path',
        'status',
        'filters',
        'batch_id',
    ];

    protected $casts = [
        'filters' => 'array',
        'status' => ExcelHistoryStatus::class,
    ];
}
