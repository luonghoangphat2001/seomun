<?php

namespace App\Services\Admin;

use App\Enums\NotificationTriggerEvent;
use App\Http\Resources\Admin\AdminNotificationTemplateResource;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminNotificationTemplateService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for notification templates.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $templateNames = NotificationTemplate::query()
            ->select('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name')
            ->filter()
            ->values()
            ->map(fn (string $name) => [
                'value' => $name,
                'label' => $name,
            ])
            ->all();

        $templateNumbers = NotificationTemplate::query()
            ->select('template_number')
            ->distinct()
            ->orderBy('template_number')
            ->pluck('template_number')
            ->filter()
            ->values()
            ->map(fn (string $number) => [
                'value' => $number,
                'label' => $number,
            ])
            ->all();

        // Registrants from notification templates
        $registrants = User::query()
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                    ->from('notification_templates')
                    ->whereNotNull('created_by')
                    ->distinct();
            })
            ->select('id', 'username', 'name')
            ->orderBy('name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->name ?? $user->username ?? ('User #'.$user->id),
            ])
            ->all();

        return [
            'template_name_options' => $templateNames,
            'template_number_options' => $templateNumbers,
            'notification_type_options' => [
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'notification_talk', 'label' => 'Notification Talk'],
                ['value' => 'sms', 'label' => 'SMS'],
            ],
            'usage_status_options' => [
                ['value' => 'enabled', 'label' => 'Enabled'],
                ['value' => 'disabled', 'label' => 'Disabled'],
            ],
            'registrant_options' => $registrants,
            'trigger_event_options' => array_map(
                fn (NotificationTriggerEvent $e) => ['value' => $e->value, 'label' => $e->label()],
                NotificationTriggerEvent::cases()
            ),
        ];
    }

    /**
     * Get notification templates with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getTemplates(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = NotificationTemplate::query()->with('creator');

        // Search term (template name, template number)
        $search = Arr::get($filters, 'search_term');
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('template_number', 'like', '%'.$search.'%');
            });
        }

        // Filter by template name
        $templateName = Arr::get($filters, 'template_name');
        if ($templateName) {
            $query->where('name', 'like', '%'.$templateName.'%');
        }

        // Filter by template number
        $templateNumber = Arr::get($filters, 'template_number');
        if ($templateNumber) {
            $query->where('template_number', 'like', '%'.$templateNumber.'%');
        }

        // Filter by notification type (email / notification_talk / sms)
        $notificationType = Arr::get($filters, 'notification_type');
        if ($notificationType) {
            $query->where('channel_configs', 'like', '%"'.$notificationType.'"%');
        }

        // Filter by usage status (enabled / disabled)
        $usageStatus = Arr::get($filters, 'usage_status');
        if ($usageStatus !== null && $usageStatus !== '') {
            $query->where('usage_status', $usageStatus);
        }

        // Filter by trigger event
        $triggerEvent = Arr::get($filters, 'trigger_event');
        if ($triggerEvent) {
            $query->where('trigger_event', $triggerEvent);
        }

        // Filter by registrant
        $registrantId = Arr::get($filters, 'registrant_id');
        if ($registrantId) {
            $query->where('created_by', $registrantId);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'name' => 'name',
            'template_number' => 'template_number',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getTemplate(int $id): NotificationTemplate
    {
        return NotificationTemplate::with('creator')->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createTemplate(User $adminUser, array $data): NotificationTemplate
    {
        return DB::transaction(function () use ($adminUser, $data) {
            return NotificationTemplate::create([
                'name' => $data['name'],
                'template_number' => $data['template_number'] ?? null,
                'trigger_event' => $data['trigger_event'] ?? null,
                'channel_configs' => $data['channel_configs'],
                'usage_status' => $data['usage_status'] ?? 'enabled',
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateTemplate(int $id, array $data): NotificationTemplate
    {
        return DB::transaction(function () use ($id, $data) {
            $template = NotificationTemplate::findOrFail($id);

            $updateData = Arr::only($data, [
                'name',
                'template_number',
                'trigger_event',
                'channel_configs',
                'usage_status',
            ]);

            $template->update($updateData);

            return $template;
        });
    }

    public function deleteTemplate(int $id): void
    {
        DB::transaction(function () use ($id) {
            $template = NotificationTemplate::findOrFail($id);
            $template->delete();
        });
    }

    public function copyTemplate(int $id): NotificationTemplate
    {
        return DB::transaction(function () use ($id) {
            $template = NotificationTemplate::findOrFail($id);

            $copy = $template->replicate();

            $copy->name = $template->name.' (Copy)';
            $copy->template_number = $template->template_number
                ? $template->template_number.'_copy'
                : null;
            $copy->push();

            return $copy->fresh('creator');
        });
    }

    public function toggleStatus(int $id, string $usageStatus): NotificationTemplate
    {
        return DB::transaction(function () use ($id, $usageStatus) {
            $template = NotificationTemplate::findOrFail($id);
            $template->usage_status = $usageStatus;
            $template->save();

            return $template;
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'templates' => AdminNotificationTemplateResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }
}
