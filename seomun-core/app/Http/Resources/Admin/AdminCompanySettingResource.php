<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCompanySettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasStamp = filled($this->stamp_path);

        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'business_registration_number' => $this->business_registration_number,
            'address' => $this->address,
            'representative_name' => $this->representative_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'industry_type' => $this->industry_type,
            'business_type' => $this->business_type,
            'stamp' => [
                'is_configured' => $hasStamp,
                'original_name' => $this->stamp_original_name,
                'preview_url' => $hasStamp ? route('admin.company-settings.stamp.show') : null,
            ],
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
