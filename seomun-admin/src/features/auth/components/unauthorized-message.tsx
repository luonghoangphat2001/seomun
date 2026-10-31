import { PageContainer } from '@/components/shared/PageContainer';
import { PlaceholderScreen } from '@/components/shared/PlaceholderScreen';

interface UnauthorizedScreenProps {
  routePath: string;
}

export function UnauthorizedMessage({ routePath }: UnauthorizedScreenProps) {
  return (
    <PageContainer className='max-w-3xl'>
      <PlaceholderScreen
        title='Unauthorized'
        description='The current role does not have access to this module. Use the role switcher in the header to review permission-aware navigation.'
        routePath={routePath}
        reviewNotes={[
          'This screen is driven by the centralized route guard.',
          'Backend authorization must remain the final authority when real auth is integrated.',
        ]}
      />
    </PageContainer>
  );
}
