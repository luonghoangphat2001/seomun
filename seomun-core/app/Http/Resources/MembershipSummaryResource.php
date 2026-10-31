<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'current_quarter_spent' => $this->current_quarter_spent,
            'current' => $this->current,
            'next' => $this->next,
        ];
    }
}
