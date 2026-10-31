import { z } from 'zod';

import { CustomerApprovalRequestType } from '../../enums';

const CUSTOMER_APPROVAL_HISTORY_STATUSES = ['accepted', 'rejected'] as const;

export const customerApprovalSearchSchema = z.object({
  request_request_type: z.nativeEnum(CustomerApprovalRequestType).optional().catch(undefined),
  request_page: z.coerce.number().int().min(1).optional().catch(undefined),
  request_per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  history_request_type: z.nativeEnum(CustomerApprovalRequestType).optional().catch(undefined),
  history_approval_status: z.enum(CUSTOMER_APPROVAL_HISTORY_STATUSES).optional().catch(undefined),
  history_page: z.coerce.number().int().min(1).optional().catch(undefined),
  history_per_page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type CustomerApprovalSearch = z.infer<typeof customerApprovalSearchSchema>;
