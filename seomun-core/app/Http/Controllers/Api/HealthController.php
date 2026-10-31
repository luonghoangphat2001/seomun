<?php

namespace App\Http\Controllers\Api;

use OpenApi\Attributes as OA;

class HealthController extends BaseController
{
    #[OA\Get(
        path: '/api/health',
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API',
        tags: ['Health']
    )]
    #[OA\Response(
        response: 200,
        description: 'API is healthy',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'status', type: 'string', example: 'ok'),
                new OA\Property(property: 'message', type: 'string', example: 'API is running'),
                new OA\Property(property: 'timestamp', type: 'string', format: 'date-time'),
            ]
        )
    )]
    public function index()
    {
        return response()->json([
            'status' => 'ok',
            'message' => 'API is running',
            'timestamp' => now()->toISOString(),
        ]);
    }
}
