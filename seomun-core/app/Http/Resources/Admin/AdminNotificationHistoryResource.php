<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNotificationHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'notification_type' => $this->notification_type,
            'template' => $this->whenLoaded('template', function () {
                return $this->template ? [
                    'id' => $this->template->id,
                    'name' => $this->template->name,
                    'template_number' => $this->template->template_number,
                ] : null;
            }),
            'recipient_name' => $this->recipient_name,
            'recipient_contact' => $this->recipient_contact,
            'message_title' => $this->message_title,
            'message_content' => $this->message_content,
            'sending_result' => $this->sending_result,
            'failure_reason' => $this->failure_reason,
            'sender' => $this->whenLoaded('sender', function () {
                return $this->sender ? [
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                    'name' => $this->sender->name,
                ] : null;
            }),
            'sent_at' => $this->sent_at?->format('Y-m-d H:i:s'),
            'meta' => $this->meta,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
