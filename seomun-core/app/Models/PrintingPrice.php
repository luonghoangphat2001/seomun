<?php

namespace App\Models;

use App\Enums\BookPrintingSizeType;
use App\Enums\BookPrintingType;
use App\Enums\MachineType;
use App\Enums\PaperSizeDivisionCode;
use App\Enums\PrintSideType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PrintingPrice extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'machine_type',
        'book_printing_size_type',
        'paper_size_division_code',
        'side_type',
        'name',
        'book_printing_type',
        'is_hot_deal',
    ];

    protected $casts = [
        'machine_type' => MachineType::class,
        'book_printing_size_type' => BookPrintingSizeType::class,
        'paper_size_division_code' => PaperSizeDivisionCode::class,
        'side_type' => PrintSideType::class,
        'book_printing_type' => BookPrintingType::class,
        'is_hot_deal' => 'boolean',
    ];

    public function printingPriceItems()
    {
        return $this->hasMany(PrintingPriceItem::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'machine_type',
                'book_printing_size_type',
                'paper_size_division_code',
                'side_type',
                'name',
                'book_printing_type',
                'is_hot_deal',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "PrintingPrice has been {$eventName}");
    }
}
