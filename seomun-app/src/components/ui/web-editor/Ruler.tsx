'use client';

import { RULER_SIZE, TICK_INTERVAL } from '@/constants/web-editor';
import { useWebEditorStore } from '@/hooks';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  width: number;
  height: number;
  zoom: number;
  pan: { x: number; y: number };
}

export const Ruler = ({ orientation, width, height, zoom, pan }: RulerProps) => {
  const { canvasSize } = useWebEditorStore();
  const isHorizontal = orientation === 'horizontal';

  // Display scale: multiplies the pixel value for display (100px shows as 5000)
  const DISPLAY_SCALE = 50;

  // Calculate canvas position
  const scaledCardWidth = canvasSize.width * zoom;
  const scaledCardHeight = canvasSize.height * zoom;
  const offsetX = (width - scaledCardWidth) / 2 + pan.x;
  const offsetY = (height - scaledCardHeight) / 2 + pan.y;

  const formatLabel = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(rounded);
  };

  // Pick 1 / 2 / 5 × 10ⁿ intervals so the ticks have readable labels at every zoom level.
  const getDynamicTickInterval = () => {
    const desiredInterval = Math.max(TICK_INTERVAL, 90 / zoom);
    const magnitude = 10 ** Math.floor(Math.log10(desiredInterval));
    const normalized = desiredInterval / magnitude;
    const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

    return niceNormalized * magnitude;
  };

  // Generate tick marks
  const generateTicks = () => {
    const ticks: React.ReactElement[] = [];
    const offset = isHorizontal ? offsetX : offsetY;
    const dynamicInterval = getDynamicTickInterval();
    const viewportSize = isHorizontal ? width : height;

    const startTick = Math.ceil(-offset / zoom / dynamicInterval);
    const endTick = Math.floor((viewportSize - offset) / zoom / dynamicInterval);

    for (let tick = startTick; tick <= endTick; tick++) {
      const i = Number((tick * dynamicInterval).toFixed(6));
      const position = offset + i * zoom;

      const tickHeight = RULER_SIZE * 0.4;

      if (isHorizontal) {
        ticks.push(
          <div
            key={i}
            className='bg-border-soft absolute'
            style={{
              left: `${position}px`,
              bottom: 0,
              width: '1px',
              height: `${tickHeight}px`,
            }}
          />,
        );

        // Add label
        ticks.push(
          <div
            key={`label-${i}`}
            className='text-border-soft absolute text-[10px] font-medium'
            style={{
              left: `${position + 4}px`,
              top: '2px',
              userSelect: 'none',
            }}>
            {formatLabel(i * DISPLAY_SCALE)}
          </div>,
        );
      } else {
        ticks.push(
          <div
            key={i}
            className='bg-border-soft absolute'
            style={{
              top: `${position}px`,
              right: 0,
              height: '1px',
              width: `${tickHeight}px`,
            }}
          />,
        );

        // Add label
        ticks.push(
          <div
            key={`label-${i}`}
            className='text-border-soft absolute text-[10px] font-medium'
            style={{
              top: `${position + 4}px`,
              left: '4px',
              userSelect: 'none',
              transform: 'rotate(-90deg)',
              transformOrigin: 'top left',
            }}>
            {formatLabel(i * DISPLAY_SCALE)}
          </div>,
        );
      }
    }

    return ticks;
  };

  if (isHorizontal) {
    return (
      <div
        className='border-border-soft absolute top-0 left-0 overflow-hidden border-b bg-white'
        style={{
          width: `${width}px`,
          height: `${RULER_SIZE}px`,
          zIndex: 10,
        }}>
        {generateTicks()}
      </div>
    );
  }

  return (
    <div
      className='border-border-soft absolute top-0 left-0 overflow-hidden border-r bg-white'
      style={{
        width: `${RULER_SIZE}px`,
        height: `${height}px`,
        zIndex: 10,
      }}>
      {generateTicks()}
    </div>
  );
};

export { RULER_SIZE };
