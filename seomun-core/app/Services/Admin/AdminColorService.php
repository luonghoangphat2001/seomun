<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminColorResource;
use App\Models\Color;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminColorService
{
    public function getColors(User $user, ?string $search = null): AnonymousResourceCollection
    {
        try {
            $query = Color::query();

            if ($search) {
                $query->whereRaw(
                    'CONCAT(r_value, g_value, b_value) LIKE ?',
                    ['%'.$search.'%']
                );
            }

            $colors = $query->get();

            return AdminColorResource::collection($colors);
        } catch (\Exception $e) {
            Log::error('Get Colors failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function createColor(User $user, array $data): AdminColorResource
    {
        try {
            DB::beginTransaction();

            $color = Color::create([
                'r_value' => $data['r_value'],
                'g_value' => $data['g_value'],
                'b_value' => $data['b_value'],
                'c_value' => $data['c_value'],
                'm_value' => $data['m_value'],
                'y_value' => $data['y_value'],
                'k_value' => $data['k_value'],
            ]);

            DB::commit();

            return new AdminColorResource($color);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Color failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function updateColor(User $user, int $colorId, array $data): AdminColorResource
    {
        try {
            $color = Color::findOrFail($colorId);

            DB::beginTransaction();

            $updatedColorData = [
                'r_value' => $data['r_value'],
                'g_value' => $data['g_value'],
                'b_value' => $data['b_value'],
                'c_value' => $data['c_value'],
                'm_value' => $data['m_value'],
                'y_value' => $data['y_value'],
                'k_value' => $data['k_value'],
            ];

            $color->update($updatedColorData);
            DB::commit();

            return new AdminColorResource($color);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Color failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function deleteColor(User $user, int $id): bool
    {
        try {
            $color = Color::findOrFail($id);

            return $color->delete();
        } catch (\Exception $e) {
            Log::error('Delete Color failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
