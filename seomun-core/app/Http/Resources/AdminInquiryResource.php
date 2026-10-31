<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminInquiryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // ===== InquiryListItem (FE spec) =====
            'id' => $this->id,
            'inquiry_number' => $this->inquiry_number,
            'inquiry_type' => $this->category?->value,
            'inquiry_type_label' => $this->category?->label(),
            'title' => $this->title,

            // Customer info
            'customer_id' => $this->user->customer->id ?? null,
            'customer_name' => $this->user->customer->company_name ?? null,

            // Inquirer info
            'inquirer_name' => $this->user->name ?? null,
            'inquirer_email' => $this->user->email ?? null,
            'inquirer_phone' => $this->user->phone ?? null,

            // Status & priority
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'priority' => null,          // TODO: add priority field/enum if required
            'priority_label' => null,    // TODO: map priority to label

            // Assignment
            'assigned_to' => $this->repliedBy ? [
                'id' => $this->repliedBy->id,
                'name' => $this->repliedBy->name,
            ] : null,

            // Attachments
            'has_attachment' => $this->relationLoaded('attachments')
                ? $this->attachments->isNotEmpty()
                : null,
            'attachment_count' => $this->relationLoaded('attachments')
                ? $this->attachments->count()
                : null,

            // Metadata
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Replies (if we later treat comments as replies)
            'reply_count' => $this->relationLoaded('comments')
                ? $this->comments->count()
                : null,
        ];
    }
}
