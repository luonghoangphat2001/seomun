'use client';

import { formatNumber } from '@/lib/utils';
import { animate } from 'motion';
import { useEffect, useRef, useState } from 'react';

export interface CounterProps {
  value: number;
  suffix?: string;
}

export const Counter = ({ value, suffix = '' }: CounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};
