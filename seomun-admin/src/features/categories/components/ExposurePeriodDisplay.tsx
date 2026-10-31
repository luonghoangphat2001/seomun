import dayjs from 'dayjs';

type ExposurePeriodDisplayProps = {
  startDate?: string | null;
  endDate?: string | null;
};

export function ExposurePeriodDisplay({ startDate, endDate }: ExposurePeriodDisplayProps) {
  if (!startDate && !endDate) {
    return <span className='text-gray-400'>-</span>;
  }

  const formattedStart = startDate ? dayjs(startDate).format('YYYY.MM.DD') : '∞';
  const formattedEnd = endDate ? dayjs(endDate).format('YYYY.MM.DD') : '∞';

  return (
    <div className='flex items-center gap-1'>
      <span className='whitespace-nowrap'>
        {formattedStart} - {formattedEnd}
      </span>
    </div>
  );
}
