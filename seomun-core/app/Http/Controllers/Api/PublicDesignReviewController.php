<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\PublicDesignReviewBatchResponseRequest;
use App\Http\Requests\PublicDesignReviewResponseRequest;
use App\Services\OrderItemDesignWorkflowService;
use Illuminate\Http\JsonResponse;

class PublicDesignReviewController extends BaseController
{
    public function __construct(private readonly OrderItemDesignWorkflowService $workflowService) {}

    public function show(string $token): JsonResponse
    {
        try {
            return $this->responseSuccess(200, '디자인 검토 정보를 조회했습니다.', $this->workflowService->publicReview($token));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function respond(PublicDesignReviewResponseRequest $request, string $token, int $orderItemId): JsonResponse
    {
        $data = $request->validated();

        try {
            $workflow = $this->workflowService->respondFromReviewLink(
                $token,
                $orderItemId,
                (int) $data['version_id'],
                $data['response'],
                $data['note'] ?? null,
            );

            return $this->responseSuccess(200, '디자인 검토 결과가 저장되었습니다.', [
                'status' => $workflow->status->value,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function respondBatch(PublicDesignReviewBatchResponseRequest $request, string $token): JsonResponse
    {
        $data = $request->validated();

        try {
            return $this->responseSuccess(200, '디자인 검토 결과가 저장되었습니다.', [
                'responses' => $this->workflowService->respondToReviewLinkBatch($token, $data['responses']),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
