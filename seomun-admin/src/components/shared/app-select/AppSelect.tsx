import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useId, useMemo, useState, type UIEvent } from 'react';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

import {
  APP_SELECT_CONTENT_SIZE_CLASSES,
  APP_SELECT_ICON_SIZE_CLASSES,
  APP_SELECT_ROOT_SIZE_CLASSES,
  APP_SELECT_TRIGGER_SIZE_CLASSES,
} from './constants';
import type { AppMultipleSelectProps, AppSelectOption, AppSelectProps, AppSingleSelectProps } from './types';

const EMPTY_SELECTED_VALUES: never[] = [];

function getOptionText<T extends string>(option: AppSelectOption<T>) {
  if (typeof option.label === 'string' || typeof option.label === 'number') {
    return String(option.label);
  }

  return option.value;
}

function getOptionKeywords<T extends string>(option: AppSelectOption<T>) {
  return [getOptionText(option), option.value, ...(option.keywords ?? [])];
}

const GROUP_HEADING_CLASSES = '**:[[cmdk-group-heading]]:text-foreground **:[[cmdk-group-heading]]:text-sm **:[[cmdk-group-heading]]:font-semibold';

function groupOptions<T extends string>(options: AppSelectOption<T>[]) {
  const sections: { heading?: string; options: AppSelectOption<T>[] }[] = [];
  for (const option of options) {
    const last = sections.at(-1);
    if (last && last.heading === option.group) last.options.push(option);
    else sections.push({ heading: option.group, options: [option] });
  }
  return sections;
}

function AppSelectOptionContent<T extends string>({ option }: { option: AppSelectOption<T> }) {
  return (
    <span className='flex min-w-0 flex-col'>
      <span className='truncate'>{option.label}</span>

      {option.description ? <span className='text-muted-foreground text-xs'>{option.description}</span> : null}
    </span>
  );
}

function AppSingleSelect<T extends string = string>(props: AppSingleSelectProps<T>) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    options,
    placeholder = 'Select option',
    searchPlaceholder = 'Search option...',
    emptyText = 'No options found.',
    size = 'md',
    disabled = false,
    isInvalid = false,
    clearable = false,
    searchable = false,
    onSearchValueChange,
    onReachEnd,
    isFetchingNextPage = false,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    triggerClassName,
    contentClassName,
    commandClassName,
  } = props;

  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const listId = useId();

  const isControlled = 'value' in props;
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const selectedOption = useMemo(() => options.find((option) => option.value === selectedValue), [options, selectedValue]);

  const hasValue = Boolean(selectedValue);

  const handleValueChange = (nextValue: T | undefined) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleSelect = (nextValue: T) => {
    handleValueChange(nextValue);
    setOpen(false);
  };

  const handleClear = () => {
    handleValueChange(undefined);
    setOpen(false);
  };

  // Infinite scroll: fire onReachEnd when scrolled near the bottom of the option list.
  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!onReachEnd || isFetchingNextPage) return;
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 120) onReachEnd();
  };

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
        if (!nextOpen) onSearchValueChange?.('');
      }}
    >
      <div
        className={cn(
          'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 relative w-full rounded-lg border transition-colors',
          APP_SELECT_ROOT_SIZE_CLASSES[size],
          disabled && 'bg-input/50 pointer-events-none cursor-not-allowed opacity-50',
          isInvalid && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
          className,
        )}
        data-invalid={isInvalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <div className='relative h-full'>
          <PopoverTrigger asChild>
            <button
              id={id}
              type='button'
              role='combobox'
              disabled={disabled}
              aria-invalid={isInvalid || undefined}
              aria-expanded={open}
              aria-haspopup='listbox'
              aria-controls={listId}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              className={cn(
                'flex h-full w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-[inherit] bg-transparent text-left outline-none disabled:cursor-not-allowed',
                APP_SELECT_TRIGGER_SIZE_CLASSES[size],
                clearable && hasValue ? 'pr-16' : 'pr-9',
                triggerClassName,
              )}
            >
              <span className={cn('min-w-0 flex-1 truncate', !selectedOption && 'text-muted-foreground')}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </button>
          </PopoverTrigger>

          {clearable && hasValue && !disabled ? (
            <button
              type='button'
              aria-label='Clear selection'
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleClear();
              }}
              className='text-muted-foreground hover:bg-muted focus-visible:ring-ring absolute top-1/2 right-8 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 outline-none focus-visible:ring-2'
            >
              <X className={APP_SELECT_ICON_SIZE_CLASSES[size]} />
            </button>
          ) : null}

          <ChevronDown
            className={cn('text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2', APP_SELECT_ICON_SIZE_CLASSES[size])}
          />
        </div>
      </div>

      <PopoverContent className={cn('w-(--radix-popover-trigger-width) p-0', contentClassName)} align='start'>
        <Command className={commandClassName}>
          {searchable ? <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchValueChange} /> : null}

          <CommandList id={listId} role='listbox' style={{ maxHeight: '18rem', overflowY: 'auto' }} onScroll={handleListScroll}>
            <CommandEmpty>{emptyText}</CommandEmpty>

            {groupOptions(options).map((section, sectionIndex) => (
              <CommandGroup
                key={section.heading ?? `section-${sectionIndex}`}
                heading={section.heading}
                className={cn(APP_SELECT_CONTENT_SIZE_CLASSES[size], GROUP_HEADING_CLASSES)}
              >
                {section.options.map((option) => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <CommandItem
                      key={option.value}
                      role='option'
                      aria-selected={isSelected}
                      value={option.value}
                      keywords={getOptionKeywords(option)}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn('cursor-pointer', section.heading && 'pl-5')}
                    >
                      <Check className={cn(APP_SELECT_ICON_SIZE_CLASSES[size], isSelected ? 'opacity-100' : 'opacity-0')} />

                      <AppSelectOptionContent option={option} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}

            {isFetchingNextPage ? (
              <div className='text-muted-foreground flex items-center justify-center gap-2 py-2 text-xs'>
                <Loader2 className='size-3 animate-spin' />
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AppMultipleSelect<T extends string = string>(props: AppMultipleSelectProps<T>) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    options,
    placeholder = 'Select options',
    searchPlaceholder = 'Search options...',
    emptyText = 'No options found.',
    size = 'md',
    disabled = false,
    isInvalid = false,
    clearable = false,
    searchable = false,
    onSearchValueChange,
    onReachEnd,
    isFetchingNextPage = false,
    maxSelectedDisplay = 2,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    triggerClassName,
    contentClassName,
    commandClassName,
  } = props;

  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<T[]>(() => defaultValue ?? []);
  const listId = useId();

  const isControlled = 'value' in props;
  const selectedValues = isControlled ? (controlledValue ?? EMPTY_SELECTED_VALUES) : uncontrolledValue;

  const selectedValueSet = useMemo(() => new Set<T>(selectedValues), [selectedValues]);

  const selectedOptions = useMemo(() => options.filter((option) => selectedValueSet.has(option.value)), [options, selectedValueSet]);

  const hasValue = selectedValues.length > 0;

  const triggerLabel = useMemo(() => {
    if (!selectedOptions.length) {
      return placeholder;
    }

    const visibleLabels = selectedOptions.slice(0, maxSelectedDisplay).map(getOptionText);
    const hiddenCount = selectedOptions.length - visibleLabels.length;

    if (hiddenCount <= 0) {
      return visibleLabels.join(', ');
    }

    return `${visibleLabels.join(', ')} +${hiddenCount}`;
  }, [maxSelectedDisplay, placeholder, selectedOptions]);

  const handleValueChange = (nextValue: T[]) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleToggle = (nextValue: T) => {
    if (selectedValueSet.has(nextValue)) {
      handleValueChange(selectedValues.filter((value) => value !== nextValue));
      return;
    }

    handleValueChange([...selectedValues, nextValue]);
  };

  const handleClear = () => {
    handleValueChange([]);
    setOpen(false);
  };

  // Infinite scroll: fire onReachEnd when scrolled near the bottom of the option list.
  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!onReachEnd || isFetchingNextPage) return;
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 120) onReachEnd();
  };

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
        // Closing remounts CommandInput empty — tell the caller too, or its query stays filtered by a term nobody can see.
        if (!nextOpen) onSearchValueChange?.('');
      }}
    >
      <div
        className={cn(
          'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 relative w-full rounded-lg border transition-colors',
          APP_SELECT_ROOT_SIZE_CLASSES[size],
          disabled && 'bg-input/50 pointer-events-none cursor-not-allowed opacity-50',
          isInvalid && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
          className,
        )}
        data-invalid={isInvalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <div className='relative h-full'>
          <PopoverTrigger asChild>
            <button
              id={id}
              type='button'
              role='combobox'
              disabled={disabled}
              aria-invalid={isInvalid || undefined}
              aria-expanded={open}
              aria-haspopup='listbox'
              aria-controls={listId}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              className={cn(
                'flex h-full w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-[inherit] bg-transparent text-left outline-none disabled:cursor-not-allowed',
                APP_SELECT_TRIGGER_SIZE_CLASSES[size],
                clearable && hasValue ? 'pr-16' : 'pr-9',
                triggerClassName,
              )}
            >
              <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'text-muted-foreground')}>{triggerLabel}</span>
            </button>
          </PopoverTrigger>

          {clearable && hasValue && !disabled ? (
            <button
              type='button'
              aria-label='Clear selection'
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleClear();
              }}
              className='text-muted-foreground hover:bg-muted focus-visible:ring-ring absolute top-1/2 right-8 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 outline-none focus-visible:ring-2'
            >
              <X className={APP_SELECT_ICON_SIZE_CLASSES[size]} />
            </button>
          ) : null}

          <ChevronDown
            className={cn('text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2', APP_SELECT_ICON_SIZE_CLASSES[size])}
          />
        </div>
      </div>

      <PopoverContent className={cn('w-(--radix-popover-trigger-width) p-0', contentClassName)} align='start'>
        <Command className={commandClassName}>
          {searchable ? <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchValueChange} /> : null}

          <CommandList id={listId} role='listbox' style={{ maxHeight: '18rem', overflowY: 'auto' }} onScroll={handleListScroll}>
            <CommandEmpty>{emptyText}</CommandEmpty>

            {groupOptions(options).map((section, sectionIndex) => (
              <CommandGroup
                key={section.heading ?? `section-${sectionIndex}`}
                heading={section.heading}
                className={cn(APP_SELECT_CONTENT_SIZE_CLASSES[size], GROUP_HEADING_CLASSES)}
              >
                {section.options.map((option) => {
                  const isSelected = selectedValueSet.has(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      role='option'
                      aria-selected={isSelected}
                      value={option.value}
                      keywords={getOptionKeywords(option)}
                      disabled={option.disabled}
                      onSelect={() => handleToggle(option.value)}
                      className={cn('cursor-pointer', section.heading && 'pl-5')}
                    >
                      <Check className={cn(APP_SELECT_ICON_SIZE_CLASSES[size], isSelected ? 'opacity-100' : 'opacity-0')} />

                      <AppSelectOptionContent option={option} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}

            {isFetchingNextPage ? (
              <div className='text-muted-foreground flex items-center justify-center gap-2 py-2 text-xs'>
                <Loader2 className='size-3 animate-spin' />
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AppSelect<T extends string = string>(props: AppSelectProps<T>) {
  if (props.mode === 'multiple') {
    return <AppMultipleSelect<T> {...props} />;
  }

  return <AppSingleSelect<T> {...props} />;
}
