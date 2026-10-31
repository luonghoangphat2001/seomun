<?php

namespace App\Services\Admin;

use App\Enums\TaskType;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Spatie\Activitylog\Models\Activity;

class AdminTaskLogService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for task logs.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        // Get unique menus (log_name) from activity logs
        $menus = Activity::query()
            ->whereNotNull('log_name')
            ->distinct()
            ->pluck('log_name')
            ->map(fn ($menu) => ['value' => $menu, 'label' => ucfirst(str_replace('_', ' ', $menu))])
            ->values()
            ->toArray();

        return [
            'menu_options' => $menus,
            'task_type_options' => TaskType::options(),
        ];
    }

    /**
     * Get task logs with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getTaskLogs(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Activity::query()->with('causer');

        // Filter by menu (log_name)
        $menu = Arr::get($filters, 'menu');
        if ($menu) {
            $query->where('log_name', $menu);
        }

        // Filter by worker name (causer - user who performed the action)
        $workerName = Arr::get($filters, 'worker_name');
        if ($workerName) {
            $query->where('causer_type', 'App\Models\User')
                ->whereHas('causer', function (Builder $q) use ($workerName) {
                    $q->where(function (Builder $inner) use ($workerName) {
                        $inner->where('name', 'like', '%'.$workerName.'%')
                            ->orWhere('username', 'like', '%'.$workerName.'%')
                            ->orWhere('email', 'like', '%'.$workerName.'%');
                    });
                });
        }

        // Filter by task type (event)
        // Map FE enum (register, modify, delete, approval) to BE event (created, updated, deleted, approved)
        $taskType = Arr::get($filters, 'task_type');
        if ($taskType) {
            try {
                $taskTypeEnum = TaskType::from($taskType);
                $event = $taskTypeEnum->toEvent();
                $query->where('event', $event);
            } catch (\ValueError $e) {
                // Invalid task type, skip filter
            }
        }

        // Filter by date range
        $dateFrom = Arr::get($filters, 'date_from');
        $dateTo = Arr::get($filters, 'date_to');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Filter by subject type (target model)
        $subjectType = Arr::get($filters, 'subject_type');
        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        // Filter by subject ID (data identifier)
        $subjectId = Arr::get($filters, 'subject_id');
        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        // Sorting
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'menu' => 'log_name',
            'worker' => 'causer_id',
            'task_type' => 'event',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Parse activity properties to extract before/after values.
     *
     * @return array<string, mixed>
     */
    public function parseActivityProperties(Activity $activity): array
    {
        $properties = $this->toArray($activity->properties ?? []);
        $old = $this->toArray($properties['old'] ?? []);
        $attributes = $this->toArray($properties['attributes'] ?? []);

        // If no old/attributes, try to get from properties directly
        if (empty($old) && empty($attributes)) {
            $old = $this->toArray($properties['old'] ?? []);
            $attributes = $this->toArray($properties['attributes'] ?? $properties);
        }

        // Get list of changed field names
        $changedFieldNames = $this->getChangedFieldNames($old, $attributes);

        // Build metadata for changed fields with i18n labels
        $changedFields = array_map(function (string $field) {
            return [
                'value' => $field,
                'label' => $this->getFieldLabel($field),
            ];
        }, $changedFieldNames);

        // Filter before_values and after_values to only include changed fields.
        // Each entry keeps the raw value, and the label represents the FIELD name (i18n),
        // so FE can easily see "what field" and "what value" without duplicating the value text.
        $beforeValues = [];
        $afterValues = [];
        foreach ($changedFieldNames as $field) {
            if (array_key_exists($field, $old)) {
                $normalized = $this->normalizeValue($old[$field]);
                $beforeValues[$field] = [
                    'value' => $normalized,
                    'label' => $this->getFieldLabel($field),
                ];
            }
            if (array_key_exists($field, $attributes)) {
                $normalized = $this->normalizeValue($attributes[$field]);
                $afterValues[$field] = [
                    'value' => $normalized,
                    'label' => $this->getFieldLabel($field),
                ];
            }
        }

        return [
            'before' => $old, // Keep full before values
            'after' => $attributes, // Keep full after values
            'changed_fields' => $changedFields,
            'before_values' => $beforeValues, // Only changed fields
            'after_values' => $afterValues, // Only changed fields
        ];
    }

    /**
     * Get list of changed field names (raw keys).
     *
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     * @return array<string>
     */
    protected function getChangedFieldNames(array $old, array $new): array
    {
        $changedFields = [];

        // Get all unique keys
        $allKeys = array_unique(array_merge(array_keys($old), array_keys($new)));

        foreach ($allKeys as $key) {
            // Skip timestamps
            if (in_array($key, ['created_at', 'updated_at', 'deleted_at'])) {
                continue;
            }

            $oldValue = $old[$key] ?? null;
            $newValue = $new[$key] ?? null;

            // Compare values (handle arrays and objects)
            if ($this->valuesAreDifferent($oldValue, $newValue)) {
                $changedFields[] = $key;
            }
        }

        return $changedFields;
    }

    /**
     * Get localized label for a field key.
     *
     * @return array{en:string,ko:string,ja:string}
     */
    protected function getFieldLabel(string $field): array
    {
        // Define known field labels. Keep keys in snake_case to match DB attributes.
        $map = [
            'name' => [
                'en' => 'Name',
                'ko' => '이름',
                'ja' => '名前',
            ],
            'description' => [
                'en' => 'Description',
                'ko' => '설명',
                'ja' => '説明',
            ],
            'usage_status' => [
                'en' => 'Usage status',
                'ko' => '사용 상태',
                'ja' => '利用状態',
            ],
            'menu_permissions' => [
                'en' => 'Menu permissions',
                'ko' => '메뉴 권한',
                'ja' => 'メニュー権限',
            ],
            'status' => [
                'en' => 'Status',
                'ko' => '상태',
                'ja' => '状態',
            ],
            'approval_status' => [
                'en' => 'Approval status',
                'ko' => '승인 상태',
                'ja' => '承認状態',
            ],
            'price' => [
                'en' => 'Price',
                'ko' => '가격',
                'ja' => '価格',
            ],
            'order_status' => [
                'en' => 'Order status',
                'ko' => '주문 상태',
                'ja' => '注文状況',
            ],
            'user_id' => [
                'en' => 'User ID',
                'ko' => '사용자 ID',
                'ja' => 'ユーザーID',
            ],
            'grant_date' => [
                'en' => 'Grant date',
                'ko' => '부여 일자',
                'ja' => '付与日',
            ],
            'admin_permission_id' => [
                'en' => 'Admin permission ID',
                'ko' => '관리자 권한 ID',
                'ja' => '管理者権限ID',
            ],
            'email' => [
                'en' => 'Email',
                'ko' => '이메일',
                'ja' => 'メール',
            ],
            'phone' => [
                'en' => 'Phone',
                'ko' => '전화번호',
                'ja' => '電話番号',
            ],
            'mobile' => [
                'en' => 'Mobile phone',
                'ko' => '휴대전화',
                'ja' => '携帯電話',
            ],
            'address' => [
                'en' => 'Address',
                'ko' => '주소',
                'ja' => '住所',
            ],
            'business_registration_number' => [
                'en' => 'Business registration number',
                'ko' => '사업자 등록번호',
                'ja' => '事業者登録番号',
            ],
            'company_name' => [
                'en' => 'Company name',
                'ko' => '회사명',
                'ja' => '会社名',
            ],
            'authority' => [
                'en' => 'Authority',
                'ko' => '권한',
                'ja' => '権限',
            ],
        ];

        if (isset($map[$field])) {
            return $map[$field];
        }

        // Fallback: humanize key (snake_case -> Title Case) and reuse for all languages.
        $humanized = ucwords(str_replace('_', ' ', $field));

        return [
            'en' => $humanized,
            'ko' => $humanized,
            'ja' => $humanized,
        ];
    }

    /**
     * Normalize value to string, number, boolean, or array.
     *
     * @param  mixed  $value
     * @return string|int|float|bool|array
     */
    protected function normalizeValue($value)
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return is_float($value) ? (float) $value : (int) $value;
        }
        // Collections are Arrayable. Convert them to their items instead of
        // exposing the Collection object's internal properties.
        if ($value instanceof Arrayable) {
            return $value->toArray();
        }
        // If value is already an array or object, keep it as array
        if (is_array($value)) {
            return $value;
        }
        if (is_object($value)) {
            return (array) $value;
        }
        // If value is a JSON string, try to decode it
        if (is_string($value) && ! empty($value)) {
            $trimmed = trim($value);
            if (($trimmed[0] === '[' || $trimmed[0] === '{')) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }
            }
        }

        return (string) $value;
    }

    /**
     * Normalize activity-log property containers to arrays.
     *
     * Spatie casts `properties` to a Collection, and custom activity payloads
     * may also store `old` or `attributes` as Collections. The diffing logic
     * below relies on array functions, so normalize these values at the
     * boundary rather than allowing a type error during rendering or export.
     *
     * @param  mixed  $value
     * @return array<string, mixed>
     */
    protected function toArray($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if ($value instanceof Arrayable) {
            return $value->toArray();
        }

        return [];
    }

    /**
     * Check if two values are different.
     *
     * @param  mixed  $oldValue
     * @param  mixed  $newValue
     */
    protected function valuesAreDifferent($oldValue, $newValue): bool
    {
        // Handle null cases
        if ($oldValue === null && $newValue === null) {
            return false;
        }

        // Compare as JSON strings for complex types
        if (is_array($oldValue) || is_object($oldValue) || is_array($newValue) || is_object($newValue)) {
            return json_encode($oldValue) !== json_encode($newValue);
        }

        return $oldValue !== $newValue;
    }
}
