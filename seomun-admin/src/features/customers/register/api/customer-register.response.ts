import type { BaseResponse } from '@/types/api';

import type { CustomerDetail } from '../../types/customer.type';

export type CustomerRegisterRESP = BaseResponse<{
  customer?: CustomerDetail;
}> & {
  httpStatus: number;
};
