<?php

namespace App\Enums;

/**
 * Size selection type enum
 *
 * Determines how size selection UI is displayed:
 * - dropdown: Show preset size dropdown only
 * - additional_options: Show preset size + additional width/height dropdowns
 * - custom_input: Allow customer to input custom width/height
 */
enum SizeSelectionType: string
{
    case Dropdown = 'dropdown';
    case AdditionalOptions = 'additional_options';
    case CustomInput = 'custom_input';

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::Dropdown => 'Dropdown (Preset sizes only)',
            self::AdditionalOptions => 'Additional Options (Preset + width/height)',
            self::CustomInput => 'Custom Input (Free size)',
        };
    }

    /**
     * Check if this type allows custom size input
     */
    public function allowsCustomInput(): bool
    {
        return $this === self::CustomInput;
    }

    /**
     * Check if this type shows additional width/height options
     */
    public function hasAdditionalOptions(): bool
    {
        return $this === self::AdditionalOptions;
    }
}
