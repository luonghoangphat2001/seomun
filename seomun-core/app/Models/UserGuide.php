<?php

namespace App\Models;

use App\Enums\UserGuideStatus;
use Illuminate\Database\Eloquent\Model;

class UserGuide extends Model
{
    protected $fillable = [
        'status',
        'button_name',
        'attached_file',
    ];

    protected $casts = [
        'status' => UserGuideStatus::class,
    ];

    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'user_guide_product'
        );
    }
}
