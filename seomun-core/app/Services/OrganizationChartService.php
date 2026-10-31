<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\OrganizationUnit;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrganizationChartService
{
    /**
     * Convert FE `positions` array into stored `position` string (JSON in DB).
     *
     * @param  array<int, mixed>|null  $positions
     */
    private function positionsToStoredPosition(?array $positions): ?string
    {
        if ($positions === null || $positions === []) {
            return null;
        }

        $items = [];
        $inputOrder = 0;

        foreach ($positions as $pos) {
            if (is_string($pos)) {
                $value = trim($pos);
                if ($value !== '') {
                    $items[] = ['sort_order' => null, 'value' => $value, '_i' => $inputOrder++];
                }

                continue;
            }

            if (! is_array($pos)) {
                continue;
            }

            $value = trim((string) ($pos['value'] ?? ''));
            if ($value === '') {
                continue;
            }

            $items[] = [
                'sort_order' => array_key_exists('sort_order', $pos) ? (int) $pos['sort_order'] : null,
                'value' => $value,
                '_i' => $inputOrder++,
            ];
        }

        if ($items === []) {
            return null;
        }

        $allHaveSortOrder = ! in_array(null, array_column($items, 'sort_order'), true);

        if ($allHaveSortOrder) {
            usort($items, function (array $a, array $b): int {
                $cmp = ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0);

                return $cmp !== 0 ? $cmp : ($a['_i'] <=> $b['_i']);
            });

            $normalized = [];
            foreach ($items as $row) {
                $normalized[] = [
                    'sort_order' => (int) $row['sort_order'],
                    'value' => $row['value'],
                ];
            }
        } else {
            usort($items, fn (array $a, array $b): int => $a['_i'] <=> $b['_i']);
            $normalized = [];
            foreach (array_values($items) as $idx => $row) {
                $normalized[] = [
                    'sort_order' => $row['sort_order'] ?? $idx,
                    'value' => $row['value'],
                ];
            }
        }

        return json_encode($normalized, JSON_UNESCAPED_UNICODE);
    }

    /**
     * API shape for create/update (and anywhere the raw DB column should not leak).
     *
     * @return array<string, mixed>
     */
    public function organizationUnitToResponse(OrganizationUnit $unit): array
    {
        $arr = $unit->toArray();
        unset($arr['position']);

        if (($arr['level'] ?? '') === 'team') {
            $arr['positions'] = $this->positionsFromStoredPosition($unit->position);
        }

        return $arr;
    }

    /**
     * Active organization units for a tenant — same filter rules as store-admin organization chart.
     * - When $customerId is set: only rows for that customer.
     * - When null: only rows with customer_id IS NULL (global / unassigned).
     *
     * @return Collection<int, OrganizationUnit>
     */
    public function getOrganizationUnitsScopedLikeChart(?int $customerId): Collection
    {
        $query = OrganizationUnit::query()
            ->where('is_active', true)
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($customerId !== null) {
            $query->where('customer_id', $customerId);
        } else {
            $query->whereNull('customer_id');
        }

        return $query->get();
    }

    /**
     * All active organization units across every tenant (no customer_id filter).
     * Used by public GET /api/auth/organization-options when no customer_id query is passed.
     *
     * @return Collection<int, OrganizationUnit>
     */
    public function getOrganizationUnitsUnscoped(): Collection
    {
        return OrganizationUnit::query()
            ->where('is_active', true)
            ->orderBy('level')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * Flat "registration / dropdown" shape — same mapping as Auth organization-options.
     *
     * @param  Collection<int, OrganizationUnit>  $units
     * @return array<int, array<string, mixed>>
     */
    public function mapUnitsToOrganizationOptions(Collection $units): array
    {
        return $units->map(function (OrganizationUnit $unit) {
            $row = [
                'id' => $unit->id,
                'parent_id' => $unit->parent_id,
                'code' => $unit->code,
                'name_ko' => $unit->name_ko,
                'name_en' => $unit->name_en,
                'level' => $unit->level,
            ];

            if ($unit->level === 'team') {
                $row['positions'] = $this->positionsFromStoredPosition($unit->position);
            }

            return $row;
        })->values()->all();
    }

    /**
     * @return list<array{sort_order: int, value: string}>
     */
    private function positionsFromStoredPosition(?string $stored): array
    {
        if ($stored === null || $stored === '') {
            return [];
        }

        $trimmed = trim((string) $stored);
        if ($trimmed !== '' && str_starts_with($trimmed, '[')) {
            $decoded = json_decode($stored, true);
            if (is_array($decoded)) {
                $out = [];
                foreach ($decoded as $i => $row) {
                    if (! is_array($row)) {
                        continue;
                    }
                    $value = trim((string) ($row['value'] ?? ''));
                    if ($value === '') {
                        continue;
                    }
                    $out[] = [
                        'sort_order' => array_key_exists('sort_order', $row) ? (int) $row['sort_order'] : (int) $i,
                        'value' => $value,
                    ];
                }
                usort($out, fn (array $a, array $b): int => $a['sort_order'] <=> $b['sort_order']);

                return $out;
            }
        }

        $raw = preg_split('/[\n,;]+/', (string) $stored);
        $strings = array_values(array_filter(array_map('trim', $raw), fn ($v) => $v !== ''));

        return array_map(
            fn (string $value, int $idx) => [
                'sort_order' => $idx,
                'value' => $value,
            ],
            $strings,
            array_keys($strings),
        );
    }

    /**
     * Get organization labels and tree nodes for the store-admin's customer.
     *
     * @return array<string, mixed>
     */
    public function getOrganizationChartForUser(User $user): array
    {
        $user->loadMissing('customer');

        /** @var Customer|null $customer */
        $customer = $user->customer;

        $labels = [
            'level_1' => $customer?->org_level_1_name ?? 'Headquarters',
            'level_2' => $customer?->org_level_2_name ?? 'Business office',
            'level_3' => $customer?->org_level_3_name ?? 'Team',
        ];

        $customerId = $customer?->id;
        /** @var Collection<int, OrganizationUnit> $units */
        $units = $this->getOrganizationUnitsScopedLikeChart($customerId);

        $nodes = $this->buildTree($units);

        return [
            'organization_labels' => $labels,
            'nodes' => $nodes,
        ];
    }

    /**
     * Create a new organization node for the user's customer.
     *
     * @param  array<string, mixed>  $data
     */
    public function createNode(User $user, array $data): OrganizationUnit
    {
        return DB::transaction(function () use ($user, $data) {
            $customerId = $user->customer_id;

            // If parent is provided, inherit its customer_id
            if (! empty($data['parent_id'])) {
                /** @var OrganizationUnit $parent */
                $parent = OrganizationUnit::query()->findOrFail($data['parent_id']);

                $customerId = $parent->customer_id;
            }

            $unit = new OrganizationUnit([
                'customer_id' => $customerId,
                'parent_id' => $data['parent_id'] ?? null,
                'level' => $data['level'],
                'name_ko' => $data['name_ko'],
                'name_en' => $data['name_en'] ?? null,
                'code' => $data['code'] ?? null,
                // Accept both `position` (string) and `positions` (array) from FE.
                'position' => array_key_exists('positions', $data)
                    ? $this->positionsToStoredPosition($data['positions'] ?? null)
                    : ($data['position'] ?? null),
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => $data['is_active'] ?? true,
            ]);

            $unit->save();

            return $unit;
        });
    }

    /**
     * Update an organization node.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateNode(User $user, int $id, array $data): OrganizationUnit
    {
        return DB::transaction(function () use ($user, $id, $data) {
            /** @var OrganizationUnit $unit */
            $unit = OrganizationUnit::query()->findOrFail($id);

            // Ensure the node belongs to the same customer as the user (if user has customer)
            if ($user->customer_id !== null && $unit->customer_id !== $user->customer_id) {
                throw new \RuntimeException('You are not allowed to modify this organization node.', 403);
            }

            if (array_key_exists('parent_id', $data)) {
                $unit->parent_id = $data['parent_id'];
            }
            if (isset($data['level'])) {
                $unit->level = $data['level'];
            }
            if (isset($data['name_ko'])) {
                $unit->name_ko = $data['name_ko'];
            }
            if (array_key_exists('name_en', $data)) {
                $unit->name_en = $data['name_en'];
            }
            if (array_key_exists('code', $data)) {
                $unit->code = $data['code'];
            }
            // Accept both `positions` (array) and `position` (string) from FE.
            if (array_key_exists('positions', $data)) {
                $unit->position = $this->positionsToStoredPosition($data['positions'] ?? null);
            } elseif (array_key_exists('position', $data)) {
                $unit->position = $data['position'];
            }
            if (array_key_exists('sort_order', $data)) {
                $unit->sort_order = (int) $data['sort_order'];
            }
            if (array_key_exists('is_active', $data)) {
                $unit->is_active = (bool) $data['is_active'];
            }

            $unit->save();

            return $unit;
        });
    }

    /**
     * Create a full tree in one request. Parent-child is expressed via nested "children";
     * backend assigns parent_id automatically. User does not need to know any parent_id.
     *
     * @param  array<int, array<string, mixed>>  $nodes  Top-level nodes; each may have "children" array
     * @return array<string, mixed> Same shape as getOrganizationChartForUser (labels + nodes tree)
     */
    public function createTree(User $user, array $nodes): array
    {
        $user->loadMissing('customer');
        $customerId = $user->customer_id;

        return DB::transaction(function () use ($user, $customerId, $nodes) {
            $sortOrder = 0;
            foreach ($nodes as $nodeSpec) {
                $this->createNodeFromSpec($customerId, $nodeSpec, null, $sortOrder);
                $sortOrder++;
            }

            return $this->getOrganizationChartForUser($user);
        });
    }

    /**
     * Create one node from a spec and recurse into children.
     *
     * @param  array<string, mixed>  $spec
     */
    private function createNodeFromSpec(?int $customerId, array $spec, ?int $parentId, int $sortOrder): OrganizationUnit
    {
        $unit = new OrganizationUnit([
            'customer_id' => $customerId,
            'parent_id' => $parentId,
            'level' => $spec['level'],
            'name_ko' => $spec['name_ko'],
            'name_en' => $spec['name_en'] ?? null,
            'code' => $spec['code'] ?? null,
            'position' => array_key_exists('positions', $spec)
                ? $this->positionsToStoredPosition($spec['positions'] ?? null)
                : ($spec['position'] ?? null),
            'sort_order' => (int) ($spec['sort_order'] ?? $sortOrder),
            'is_active' => $spec['is_active'] ?? true,
        ]);
        $unit->save();

        $children = $spec['children'] ?? [];
        $childSort = 0;
        foreach ($children as $childSpec) {
            $this->createNodeFromSpec($customerId, $childSpec, $unit->id, $childSort);
            $childSort++;
        }

        return $unit;
    }

    /**
     * Delete an organization node (only if it has no children).
     */
    public function deleteNode(User $user, int $id): void
    {
        try {
            /** @var OrganizationUnit $unit */
            $unit = OrganizationUnit::query()->findOrFail($id);

            if ($user->customer_id !== null && $unit->customer_id !== $user->customer_id) {
                throw new \RuntimeException('You are not allowed to delete this organization node.', 403);
            }

            if ($unit->children()->exists()) {
                throw new \RuntimeException('Cannot delete organization node that has children.', 400);
            }

            $unit->delete();
        } catch (\Throwable $e) {
            Log::error('Failed to delete organization unit', [
                'user_id' => $user->id,
                'unit_id' => $id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @param  Collection<int, OrganizationUnit>  $units
     * @return array<int, array<string, mixed>>
     */
    private function buildTree(Collection $units): array
    {
        if ($units->isEmpty()) {
            return [];
        }

        $nodes = [];

        foreach ($units as $unit) {
            $node = [
                'id' => $unit->id,
                'customer_id' => $unit->customer_id,
                'parent_id' => $unit->parent_id,
                'level' => $unit->level,
                'name_ko' => $unit->name_ko,
                'name_en' => $unit->name_en,
                'code' => $unit->code,
                'sort_order' => $unit->sort_order,
                'is_active' => (bool) $unit->is_active,
                'children' => [],
            ];

            // Only team nodes carry `positions` (matches FE request shape).
            if ($unit->level === 'team') {
                $node['positions'] = $this->positionsFromStoredPosition($unit->position);
            }

            $nodes[$unit->id] = $node;
        }

        $tree = [];

        foreach ($nodes as $id => &$node) {
            $parentId = $node['parent_id'];

            if ($parentId !== null && isset($nodes[$parentId])) {
                $nodes[$parentId]['children'][] = &$node;
            } else {
                $tree[] = &$node;
            }
        }
        unset($node); // break reference

        return $tree;
    }
}
