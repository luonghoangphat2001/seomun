<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionSetting extends Model
{
    public const SINGLETON_ID = 1;

    protected $fillable = [
        'id',
        'logo',
        'address',
        'email',
        'phone_number',
    ];

    public static function getOrCreate(): self
    {
        return self::firstOrCreate(['id' => self::SINGLETON_ID]);
    }
}
