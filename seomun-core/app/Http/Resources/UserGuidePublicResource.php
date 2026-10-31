<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserGuidePublicResource extends JsonResource
{
    /**
     * Public API: 이용안내 (usage guide) for product detail page.
     */
    public function toArray(Request $request): array
    {
        $url = $this->attached_file
            ? $this->normalizeUrl(Storage::disk('public')->url($this->attached_file))
            : null;

        return [
            'id' => $this->id,
            'button_name' => $this->button_name,
            'attached_file_url' => $url,
        ];
    }

    private function normalizeUrl(string $url): string
    {
        return preg_replace('#(?<!:)//+#', '/', $url);
    }
}
