<?php

namespace App\Http\Resources\Admin;

use App\Enums\TaskType;
use App\Services\Admin\AdminTaskLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTaskLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Extract before/after values from properties using service method
        $service = app(AdminTaskLogService::class);
        $parsed = $service->parseActivityProperties($this->resource);

        // Map BE event (created, updated, deleted, approved) to FE enum (register, modify, delete, approval)
        $taskTypeEnum = TaskType::fromEvent($this->event ?? '');
        $taskTypeValue = $taskTypeEnum?->value ?? ($this->event ?? 'unknown');

        return [
            'id' => $this->id,
            'menu' => $this->log_name ?? 'System',
            'task_type' => $taskTypeValue,
            'description' => $this->description,
            'worker' => $this->whenLoaded('causer', function () {
                return $this->causer ? [
                    'id' => $this->causer->id,
                    'username' => $this->causer->username ?? null,
                    'name' => $this->causer->name ?? null,
                    'email' => $this->causer->email ?? null,
                ] : null;
            }),
            'target_menu' => $this->subject_type ? class_basename($this->subject_type) : null,
            'data_identifier' => $this->subject_id,
            'changed_fields' => $parsed['changed_fields'] ?? [],
            'before_values' => $parsed['before_values'] ?? [],
            'after_values' => $parsed['after_values'] ?? [],
            'subject' => $this->whenLoaded('subject', function () {
                return $this->subject ? [
                    'type' => class_basename($this->subject_type),
                    'id' => $this->subject_id,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
