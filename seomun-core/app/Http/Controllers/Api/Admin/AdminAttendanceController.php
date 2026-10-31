<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Attendance\AdminCreateAttendanceRequest;
use App\Http\Requests\Admin\Attendance\AdminGetAttendanceRequest;
use App\Http\Requests\Admin\Attendance\AdminUpdateAttendanceRequest;
use App\Http\Resources\Admin\AdminAttendanceResource;
use App\Services\Admin\AdminAttendanceService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminAttendanceController extends BaseController
{
    public function __construct(
        protected AdminAttendanceService $adminAttendanceService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminGetAttendanceRequest $request): JsonResponse
    {
        try {
            $attendances = $this->adminAttendanceService->getList(
                userId: $request->filled('user_id') ? (int) $request->input('user_id') : null,
                dateFrom: $request->input('date_from'),
                dateTo: $request->input('date_to'),
                status: $request->input('status'),
                perPage: (int) $request->input('per_page', 15),
            );

            return $this->responsePaginatedSuccess(200, '출석 목록이 성공적으로 조회되었습니다.', [
                'attendances' => AdminAttendanceResource::collection($attendances->items()),
            ], $this->paginationService->format($attendances));
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $attendance = $this->adminAttendanceService->getById($id);

            return response()->json([
                'success' => true,
                'data' => ['attendance' => new AdminAttendanceResource($attendance)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '근태 기록을 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(AdminCreateAttendanceRequest $request): JsonResponse
    {
        try {
            $attendance = $this->adminAttendanceService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => '근태 등록 성공',
                'data' => ['attendance' => new AdminAttendanceResource($attendance)],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateAttendanceRequest $request, int $id): JsonResponse
    {
        try {
            $attendance = $this->adminAttendanceService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => '근태 수정 성공',
                'data' => ['attendance' => new AdminAttendanceResource($attendance)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '근태 기록을 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminAttendanceService->delete($id);

            return response()->json(['success' => true, 'message' => '근태 삭제 성공']);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '근태 기록을 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
