<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class InquiryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'category_label_en' => $this->category->labelEn(),
            'title' => $this->title,
            'content' => $this->content,
            'order_number' => $this->order_number,
            'contact' => $this->contact,
            'manager_name' => $this->manager_name,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_label_en' => $this->status->labelEn(),
            'author_name' => $this->relationLoaded('user') && $this->user ? $this->user->name : null,
            'product_id' => $this->product_id,
            'product' => $this->relationLoaded('product') && $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'name_en' => $this->product->name_en,
                'sku' => $this->product->sku,
                'images' => $this->product->images,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include comments and attachments if loaded
        if ($this->relationLoaded('comments')) {
            $data['comments'] = InquiryCommentResource::collection($this->comments);
        }

        if ($this->relationLoaded('attachments')) {
            $mapAttachment = fn ($attachment) => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_path' => $attachment->file_path,
                'file_url' => $attachment->file_path ? asset('storage/' . $attachment->file_path) : null,
                'file_type' => $attachment->file_type,
                'file_size' => $attachment->file_size,
            ];

            $data['attachments'] = $this->attachments
                ->where('is_reply_attachment', false)
                ->values()
                ->map($mapAttachment);

            $data['reply_attachments'] = $this->attachments
                ->where('is_reply_attachment', true)
                ->values()
                ->map($mapAttachment);
        }

        return $data;
    }
}
