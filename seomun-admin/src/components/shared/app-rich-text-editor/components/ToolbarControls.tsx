import { Palette } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { COLOR_PICKER_THROTTLE_MS } from '../constants';
import type { EditorButtonProps, TextColorPickerProps, ToolbarMenuProps, ToolbarSelectProps } from '../types';
import { normalizeColorInputValue } from '../utils';

export function EditorButton({ label, disabledLabel, icon: Icon, onClick, disabled = false, active = false }: EditorButtonProps) {
  const tooltip = disabled && disabledLabel ? disabledLabel : label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex' tabIndex={disabled ? 0 : -1}>
          <Button
            type='button'
            variant={active ? 'secondary' : 'ghost'}
            size='icon-sm'
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active || undefined}
            className={cn(active && 'bg-primary/15 text-foreground hover:bg-primary/20')}
          >
            <Icon className='size-4' />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarSelect({ label, value, options, onChange, disabled = false, disabledLabel, className }: ToolbarSelectProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex' tabIndex={disabled ? 0 : -1}>
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger size='sm' className={className} aria-label={label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabled && disabledLabel ? disabledLabel : label}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarMenu({ label, icon: Icon, groups, onSelect, disabled = false, disabledLabel }: ToolbarMenuProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex' tabIndex={disabled ? 0 : -1}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button' variant='ghost' size='icon-sm' disabled={disabled} aria-label={label}>
                <Icon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            {/* Keep focus in the editor (the action already focused it) instead of returning it to the trigger. */}
            <DropdownMenuContent align='start' onCloseAutoFocus={(event) => event.preventDefault()} className='min-w-0 p-1'>
              {groups.map((items, index) => (
                <Fragment key={items[0]?.value ?? index}>
                  {index > 0 ? <DropdownMenuSeparator className='bg-border' /> : null}
                  <div className='flex gap-0.5'>
                    {items.map((item) => (
                      <Tooltip key={item.value}>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onSelect={() => onSelect(item.value)}
                            aria-label={item.label}
                            className='size-8 cursor-pointer justify-center p-0'
                          >
                            {item.icon}
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent>{item.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabled && disabledLabel ? disabledLabel : label}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarDivider() {
  return <div className='bg-border mx-1 h-6 w-px shrink-0' aria-hidden='true' />;
}

export function TextColorPicker({ label = 'Text color', icon: Icon = Palette, value, onChange, disabled = false }: TextColorPickerProps) {
  const [draftColor, setDraftColor] = useState<string | null>(null);
  const latestColorRef = useRef('');
  const throttleTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(throttleTimeoutRef.current), []);

  const handleColorInput = (color: string) => {
    setDraftColor(color);
    latestColorRef.current = color;

    if (throttleTimeoutRef.current !== undefined) {
      return;
    }

    throttleTimeoutRef.current = window.setTimeout(() => {
      throttleTimeoutRef.current = undefined;
      onChange(latestColorRef.current);
    }, COLOR_PICKER_THROTTLE_MS);
  };

  return (
    <label
      className={cn(
        'hover:bg-accent hover:text-accent-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors',
        disabled && 'pointer-events-none opacity-50',
      )}
      title={label}
      aria-label={label}
    >
      <Icon className='size-4' />
      <input
        type='color'
        value={draftColor ?? normalizeColorInputValue(value)}
        onChange={(event) => handleColorInput(event.target.value)}
        onBlur={() => setDraftColor(null)}
        disabled={disabled}
        className='sr-only'
        aria-label={label}
      />
    </label>
  );
}
