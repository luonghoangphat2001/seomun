<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminCodeResource;
use App\Models\Code;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class AdminCodeService
{
    public function getCodes(User $user): AnonymousResourceCollection
    {
        try {
            $query = Code::query()
                ->orderByRaw("CAST(JSON_EXTRACT(properties, '$.sort_order') AS UNSIGNED) ASC")
                ->orderByRaw("
                    CASE JSON_UNQUOTE(JSON_EXTRACT(properties, '$.sales_status'))
                        WHEN 'open' THEN 0
                        WHEN 'closed' THEN 1
                        ELSE 2
                    END ASC"
                )
                ->orderBy('name', 'ASC');

            $colors = $query->get();

            return AdminCodeResource::collection($colors);
        } catch (\Exception $e) {
            Log::error('Get Codes failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
