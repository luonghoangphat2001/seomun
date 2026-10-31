import { History, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScanHistoryItem } from '../types/production-tools.type';
import { getStatusLabel } from '../utils/production-tools.utils';

type ScanHistoryListProps = {
  recentScans: ScanHistoryItem[];
  onSelectScan: (scan: ScanHistoryItem) => void;
};

export function ScanHistoryList({ recentScans, onSelectScan }: ScanHistoryListProps) {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='border-b pb-3'>
        <CardTitle className='text-md flex items-center gap-2 font-semibold'>
          <History className='text-muted-foreground size-4' />
          Recent Scan Logs
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        {recentScans.length === 0 ? (
          <div className='text-muted-foreground py-10 text-center text-sm'>No logs in this session. Successful scans appear here.</div>
        ) : (
          <div className='max-h-[380px] space-y-3 overflow-y-auto pr-1'>
            {recentScans.map((scan) => (
              <button
                key={scan.id}
                type='button'
                onClick={() => onSelectScan(scan)}
                className='bg-card hover:bg-accent/40 focus:ring-primary/20 flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition focus:ring-2 focus:outline-none'
              >
                <div className='flex-1 space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-primary text-sm font-bold'>{scan.order_number}</span>
                    <span className='text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
                      {scan.scanned_at.split(' ')[1]}
                    </span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1 text-xs font-semibold'>
                    <span>{getStatusLabel(scan.status_before)}</span>
                    <ArrowRight className='text-muted-foreground/60 size-3' />
                    <span className='text-primary font-bold'>{getStatusLabel(scan.status_after, scan.status_after_label)}</span>
                  </div>
                  <div className='text-muted-foreground max-w-[220px] truncate text-xs italic'>{scan.message}</div>
                </div>

                <div className='shrink-0 text-right'>
                  <div className='text-muted-foreground text-[10px]'>{scan.order_details ? 'Inspect Info' : 'No Details'}</div>
                  <div className='text-primary mt-1 text-[10px] font-bold hover:underline'>View →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
