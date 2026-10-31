<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardNoticeConfig extends Model
{
    protected $fillable = [
        'board_type',
        'notice_enabled',
        'notice_message',
    ];

    protected $casts = [
        'notice_enabled' => 'boolean',
    ];
}
