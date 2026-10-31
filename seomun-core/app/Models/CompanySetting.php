<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    public const SINGLETON_ID = 1;

    protected $fillable = [
        'id',
        'company_name',
        'business_registration_number',
        'address',
        'representative_name',
        'phone',
        'email',
        'website',
        'industry_type',
        'business_type',
        'stamp_path',
        'stamp_mime_type',
        'stamp_original_name',
    ];

    public static function getOrCreate(): self
    {
        return self::firstOrCreate(['id' => self::SINGLETON_ID]);
    }
}
