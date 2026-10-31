<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationChartBatchRequest;
use App\Http\Requests\Organization\StoreOrganizationUnitRequest;
use App\Http\Requests\Organization\UpdateOrganizationUnitRequest;
use App\Services\OrganizationChartService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrganizationChartController extends Controller
{
    public function __construct(
        protected OrganizationChartService $organizationChartService
    ) {}

    /**
     * Get organization chart (labels + tree nodes) for current store admin.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $data = $this->organizationChartService->getOrganizationChartForUser($user);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Failed to get organization chart', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직도를 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Flat list of organization units for dropdowns — same tenant filter as organization-chart (index).
     */
    public function flatOptions(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $customerId = $user->customer_id;

            $units = $this->organizationChartService->getOrganizationUnitsScopedLikeChart($customerId);
            $organizations = $this->organizationChartService->mapUnitsToOrganizationOptions($units);

            return response()->json([
                'success' => true,
                'data' => [
                    'organizations' => $organizations,
                    'meta' => [
                        'scope' => 'chart_tenant',
                        'customer_id' => $customerId,
                    ],
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Failed to get organization unit options', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직 옵션을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Create a full organization tree in one request. No parent_id needed:
     * send nested "children"; backend assigns parent_id automatically.
     */
    public function storeBatch(StoreOrganizationChartBatchRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $nodes = $request->validated('nodes', []);

            $data = $this->organizationChartService->createTree($user, $nodes);

            return response()->json([
                'success' => true,
                'message' => '조직도가 성공적으로 생성되었습니다.',
                'data' => $data,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to create organization chart batch', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직도 일괄 생성 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new organization node.
     */
    public function store(StoreOrganizationUnitRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $unit = $this->organizationChartService->createNode($user, $validated);

            return response()->json([
                'success' => true,
                'message' => '조직도 노드가 성공적으로 생성되었습니다.',
                'data' => [
                    'node' => $this->organizationChartService->organizationUnitToResponse($unit),
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to create organization node', [
                'user_id' => $request->user()->id ?? null,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직 노드를 생성하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an organization node.
     */
    public function update(UpdateOrganizationUnitRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $unit = $this->organizationChartService->updateNode($user, $id, $validated);

            return response()->json([
                'success' => true,
                'message' => '조직도 노드가 성공적으로 수정되었습니다.',
                'data' => [
                    'node' => $this->organizationChartService->organizationUnitToResponse($unit),
                ],
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '조직 노드를 찾을 수 없습니다.',
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to update organization node', [
                'user_id' => $request->user()->id ?? null,
                'node_id' => $id,
                'payload' => $request->all(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직 노드를 수정하는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an organization node.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $this->organizationChartService->deleteNode($user, $id);

            return response()->json([
                'success' => true,
                'message' => '조직도 노드가 성공적으로 삭제되었습니다.',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '조직 노드를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to delete organization node', [
                'user_id' => $request->user()->id ?? null,
                'node_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '조직 노드를 삭제하는 중 오류가 발생했습니다.',
            ], 500);
        }
    }
}
