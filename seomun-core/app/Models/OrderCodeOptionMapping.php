<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderCodeOptionMapping extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'order_code_option_mappings';

    protected $fillable = [
        'order_code',
        'name',
        'url_image',
    ];

    public function erpOptionGroups()
    {
        return $this->belongsToMany(ErpOptionGroup::class, 'order_code_erp_option_group', 'order_code_id', 'erp_option_group_id')
            ->withPivot('default_option_id', 'default_is_none');
    }

    public function erpOptions()
    {
        return $this->belongsToMany(ErpOption::class, 'order_code_erp_option', 'order_code_id', 'erp_option_id')
            ->withPivot('product_type_condition', 'osrc_um', 'osrc_um_min');
    }

    public function getErpOptionGroupIdsAttribute()
    {
        return $this->erpOptionGroups->pluck('id')->toArray();
    }
}
