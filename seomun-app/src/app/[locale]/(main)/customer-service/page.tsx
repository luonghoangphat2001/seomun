import { redirect } from 'next/navigation';
import { ROUTES } from '@/routes';

export default function CustomerServicePage() {
  redirect(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT);
}
