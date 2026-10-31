import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  routePath: string;
  reviewNotes?: string[];
  className?: string;
};

export function PlaceholderScreen({ title, description, routePath, reviewNotes = [], className }: PlaceholderScreenProps) {
  return (
    <section className={cn('flex flex-col gap-6', className)}>
      <header className='flex flex-col gap-3'>
        <Badge variant='secondary' className='w-fit rounded-md px-3 py-1'>
          Placeholder Module
        </Badge>
        <div className='space-y-2'>
          <h1 className='title-32 text-foreground'>{title}</h1>
          <p className='body-16 text-muted-foreground max-w-3xl'>{description}</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className='title-18'>Current Route</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='body-14 text-muted-foreground'>
            Thin route wiring is active. This screen is owned by the feature module and is safe to replace with real business UI in later slices.
          </p>
          <code className='bg-muted text-foreground inline-flex w-fit rounded-lg px-3 py-2 text-sm'>{routePath}</code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='title-18'>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {reviewNotes.map((note) => (
              <li key={note} className='body-14 text-muted-foreground border-border rounded-2xl border px-4 py-3'>
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
