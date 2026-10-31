<?php

namespace App\Services;

use App\Models\CompanySetting;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompanySettingsService
{
    public function getSettings(): CompanySetting
    {
        return CompanySetting::getOrCreate();
    }

    public function updateSettings(array $data): CompanySetting
    {
        $settings = $this->getSettings();
        $settings->update($data);

        return $settings->refresh();
    }

    public function replaceStamp(UploadedFile $stamp): CompanySetting
    {
        $this->getSettings();
        $disk = Storage::disk('local');
        $newPath = $stamp->store('company-settings/stamps', 'local');

        if (! is_string($newPath) || $newPath === '') {
            throw new \RuntimeException('회사 도장 파일을 저장하지 못했습니다.');
        }

        try {
            $oldPath = null;
            $settings = DB::transaction(function () use ($stamp, $newPath, &$oldPath): CompanySetting {
                $settings = CompanySetting::query()
                    ->whereKey(CompanySetting::SINGLETON_ID)
                    ->lockForUpdate()
                    ->firstOrFail();
                $oldPath = $settings->stamp_path;
                $settings->update([
                    'stamp_path' => $newPath,
                    'stamp_mime_type' => $stamp->getMimeType(),
                    'stamp_original_name' => $stamp->getClientOriginalName(),
                ]);

                return $settings;
            });
        } catch (\Throwable $e) {
            $this->deleteStampFile($disk, $newPath);

            throw $e;
        }

        if ($oldPath && $oldPath !== $newPath) {
            $this->deleteStampFile($disk, $oldPath);
        }

        return $settings->refresh();
    }

    public function removeStamp(): CompanySetting
    {
        $this->getSettings();
        $oldPath = null;

        $settings = DB::transaction(function () use (&$oldPath): CompanySetting {
            $settings = CompanySetting::query()
                ->whereKey(CompanySetting::SINGLETON_ID)
                ->lockForUpdate()
                ->firstOrFail();
            $oldPath = $settings->stamp_path;
            $settings->update([
                'stamp_path' => null,
                'stamp_mime_type' => null,
                'stamp_original_name' => null,
            ]);

            return $settings;
        });

        if ($oldPath) {
            $this->deleteStampFile(Storage::disk('local'), $oldPath);
        }

        return $settings->refresh();
    }

    public function getStampResponse(): StreamedResponse
    {
        $settings = $this->getSettings();
        $disk = Storage::disk('local');

        if (! $settings->stamp_path || ! $disk->exists($settings->stamp_path)) {
            throw new ModelNotFoundException('등록된 회사 도장을 찾을 수 없습니다.');
        }

        return $disk->response(
            $settings->stamp_path,
            $settings->stamp_original_name ?? 'company-stamp',
            [
                'Content-Type' => $settings->stamp_mime_type ?? 'application/octet-stream',
            ]
        );
    }

    public function getStampDataUri(): ?string
    {
        $settings = $this->getSettings();
        $disk = Storage::disk('local');

        if (! $settings->stamp_path || ! $settings->stamp_mime_type || ! $disk->exists($settings->stamp_path)) {
            return null;
        }

        return sprintf(
            'data:%s;base64,%s',
            $settings->stamp_mime_type,
            base64_encode($disk->get($settings->stamp_path))
        );
    }

    private function deleteStampFile(FilesystemAdapter $disk, ?string $path): void
    {
        if (! $path) {
            return;
        }

        try {
            if ($disk->delete($path)) {
                return;
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to delete a private company stamp file.', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return;
        }

        Log::warning('Failed to delete a private company stamp file.', ['path' => $path]);
    }
}
