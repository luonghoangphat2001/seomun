<?php

namespace App\Enums;

enum TaskType: string
{
    case REGISTER = 'register';
    case MODIFY = 'modify';
    case DELETE = 'delete';
    case APPROVAL = 'approval';

    /**
     * Get all task type values.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Map FE enum to BE event (Spatie Activity Log event).
     */
    public function toEvent(): string
    {
        return match ($this) {
            self::REGISTER => 'created',
            self::MODIFY => 'updated',
            self::DELETE => 'deleted',
            self::APPROVAL => 'approved',
        };
    }

    /**
     * Map BE event (Spatie Activity Log event) to FE enum.
     */
    public static function fromEvent(string $event): ?self
    {
        return match ($event) {
            'created' => self::REGISTER,
            'updated' => self::MODIFY,
            'deleted' => self::DELETE,
            'approved' => self::APPROVAL,
            default => null,
        };
    }

    /**
     * Get all task type options for search filters.
     *
     * @return array<array<string, string>>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value],
            self::cases()
        );
    }
}
