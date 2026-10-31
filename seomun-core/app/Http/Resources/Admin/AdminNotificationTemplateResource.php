<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNotificationTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $channelConfigs = $this->channel_configs ?? [];
        $channelTypes = array_keys(is_array($channelConfigs) ? $channelConfigs : []);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'template_number' => $this->template_number,
            'trigger_event' => $this->trigger_event?->value,
            'trigger_event_label' => $this->trigger_event?->label(),
            'channel_types' => $channelTypes,
            'channel_configs' => $channelConfigs,
            'usage_status' => [
                'value' => $this->usage_status,
                'label' => $this->usage_status === 'enabled' ? 'Enabled' : 'Disabled',
            ],
            'registrant' => $this->whenLoaded('creator', function () {
                return $this->creator ? [
                    'id' => $this->creator->id,
                    'username' => $this->creator->username,
                    'name' => $this->creator->name,
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
