<?php

namespace App\Services;

use App\Models\PaymentLineConfig;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentLineConfigService
{
    public function upsertPaymentLineConfig(User $user, array $data): array
    {
        try {
            DB::beginTransaction();

            $user = User::where('id', $data['user_id'])->firstOrFail();
            $config = PaymentLineConfig::query()->firstOrNew();

            $config->fill([
                'user_id' => $data['user_id'],
                'is_enabled' => $data['is_enabled'],
                'is_use_email_notification' => $data['is_use_email_notification'],
            ]);

            $config->save();

            DB::commit();

            return [
                'user_id' => $config->user_id,
                'name' => $user->name,
                'username' => $user->username,
                'is_enabled' => $config->is_enabled,
                'is_use_email_notification' => $config->is_use_email_notification,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getPaymentLineConfig(User $user): array
    {
        try {
            $config = PaymentLineConfig::query()->first();

            if (! $config) {
                return [
                    'user_id' => null,
                    'name' => null,
                    'username' => null,
                    'is_enabled' => false,
                    'is_use_email_notification' => false,
                ];
            }

            $user = $config->user()->firstOrFail();

            return [
                'user_id' => $config->user_id,
                'name' => $user->name,
                'username' => $user->username,
                'is_enabled' => $config->is_enabled,
                'is_use_email_notification' => $config->is_use_email_notification,
            ];
        } catch (\Exception $e) {
            Log::error('Create StorePermission failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
