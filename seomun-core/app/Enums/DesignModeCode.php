<?php

namespace App\Enums;

enum DesignModeCode: string
{
    case WEB_EDITOR = 'web_editor';
    case UPLOAD_FILE = 'upload_file';

    public function label(): string
    {
        return match ($this) {
            self::WEB_EDITOR => 'web editor',
            self::UPLOAD_FILE => 'upload file',
        };
    }

    /**
     * Whether orders using this mode must pass the designer/customer approval
     * workflow before an administrator can confirm the order for production.
     */
    public function requiresDesignApproval(): bool
    {
        return match ($this) {
            self::UPLOAD_FILE => true,
            self::WEB_EDITOR => false,
        };
    }
}
