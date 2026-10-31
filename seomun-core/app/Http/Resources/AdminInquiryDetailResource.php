<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminInquiryDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // ===== InquiryDetail (FE spec) =====
        $data = [
            'id' => $this->id,
            'inquiry_number' => $this->inquiry_number,

            'inquiry_type' => $this->category?->value,
            'inquiry_type_label' => $this->category?->label(),

            'title' => $this->title,
            'content' => $this->content,
            'manager_name' => $this->manager_name,

            // Customer info
            'customer_id' => $this->user->customer->id ?? null,
            'customer_name' => $this->user->customer->company_name ?? null,

            // Inquirer info
            'inquirer_name' => $this->user->name ?? null,
            'inquirer_email' => $this->user->email ?? null,
            'inquirer_phone' => $this->contact ?: $this->user->phone ?? null,
            'inquirer_department' => null, // TODO: map department if available

            // Status & priority
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'priority' => null,       // TODO: add priority field/enum if required
            'priority_label' => null, // TODO: map priority to label

            // Assignment
            'assigned_to' => $this->repliedBy ? [
                'id' => $this->repliedBy->id,
                'name' => $this->repliedBy->name,
                'email' => $this->repliedBy->email,
            ] : null,

            // Attachments (original inquiry files only)
            'attachments' => null,

            // Metadata
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Related entities
            'related_order_number' => $this->order_number ?? null,
            'related_design_id' => null, // TODO: map to design if business requires
            'product' => $this->category?->value === 'product' && $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
                'pricing_profile_id' => $this->product->pricing_profile_id,
            ] : null,
        ];

        if ($this->relationLoaded('attachments')) {
            $inquiryAttachments = $this->attachments->where('is_reply_attachment', false);
            // FE spec for InquiryDetail.attachments (no separate reply_attachments here)
            $data['attachments'] = $inquiryAttachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'file_name' => $attachment->file_name,
                    'file_url' => $attachment->file_path
                        ? asset('storage/'.$attachment->file_path)
                        : null,
                    'file_size' => $attachment->file_size,
                    'uploaded_at' => $attachment->created_at,
                ];
            })->values();
        }

        return $data;
    }
}
