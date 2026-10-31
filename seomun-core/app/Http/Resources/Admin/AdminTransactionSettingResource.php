<?php

namespace App\Http\Resources\Admin;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminTransactionSettingResource extends JsonResource
{
    public function __construct(mixed $resource, private readonly CompanySetting $companySetting)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $hasStamp = filled($this->companySetting->stamp_path);

        return [
            'id' => $this->id,
            'logo' => $this->logo
                ? (filter_var($this->logo, FILTER_VALIDATE_URL)
                    ? $this->logo
                    : Storage::disk('public')->url($this->logo))
                : null,
            'stamp' => [
                'is_configured' => $hasStamp,
                'original_name' => $this->companySetting->stamp_original_name,
                'preview_url' => $hasStamp ? route('admin.company-settings.stamp.show') : null,
            ],
            'address' => $this->address,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
