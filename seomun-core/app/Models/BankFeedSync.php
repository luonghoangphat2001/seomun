<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankFeedSync extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['account_identity', 'job_id'];

    protected $casts = [
        'requested_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'completed_through' => 'date',
        'last_success_at' => 'datetime',
        'last_error_at' => 'datetime',
    ];
}
