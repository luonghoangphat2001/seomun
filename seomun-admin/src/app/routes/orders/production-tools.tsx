import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { ProductionToolsPage } from '@/features/orders/production-tools';
import { USER_ROLE } from '@/lib/auth/types';

const PRODUCTION_TOOL_ROLES = [USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.SUPER_ADMIN] as const;

export const Route = createFileRoute('/orders/production-tools')({
  beforeLoad: requireRole(PRODUCTION_TOOL_ROLES),
  head: createTitleHead('nav.orders.production_tools', 'Production Tools'),
  component: ProductionToolsPage,
});
