<?php

namespace App\Services;

use App\Models\TransactionSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TransactionSettingsService
{
    public function getSettings(): TransactionSetting
    {
        return TransactionSetting::getOrCreate();
    }

    public function updateSettings(array $data): TransactionSetting
    {
        $settings = $this->getSettings();
        $settings->update($data);

        return $settings->refresh();
    }

    public function replaceLogo(UploadedFile $logo): TransactionSetting
    {
        $settings = $this->getSettings();

        $newPath = $logo->store('transaction-settings/logos', 'public');

        if (! is_string($newPath) || $newPath === '') {
            throw new \RuntimeException('Logo file could not be stored.');
        }

        $oldPath = $settings->logo;

        try {
            $settings->update(['logo' => $newPath]);
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($newPath);

            throw $e;
        }

        if ($oldPath && $oldPath !== $newPath && ! filter_var($oldPath, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $settings->refresh();
    }
}
