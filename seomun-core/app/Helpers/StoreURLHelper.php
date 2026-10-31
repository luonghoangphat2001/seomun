<?php

namespace App\Helpers;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoreURLHelper
{
    public static function storeDesignPDF(?string $url, string $directory = 'order/design'): ?string
    {
        if (blank($url)) {
            return null;
        }

        $disk = 'public';

        try {
            $contents = @file_get_contents($url);
        } catch (\Throwable $e) {
            $contents = false;
        }

        if ($contents === false) {
            return $url;
        }

        $urlPath = parse_url($url, PHP_URL_PATH) ?? '';
        $extension = pathinfo($urlPath, PATHINFO_EXTENSION) ?: 'jpg';
        $filename = Str::random(20) . '.' . strtolower($extension);
        $path = $directory . '/' . $filename;

        Storage::disk($disk)->put($path, $contents);

        return Storage::disk($disk)->url($path);
    }
}