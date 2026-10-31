import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customerListKeys } from '../../list';
import type { CustomerRegisterSubmitValues } from '../schemas';
import { mapCustomerRegisterFormToRequest, registerCustomerService } from './customer-register.service';

export function useCustomerRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CustomerRegisterSubmitValues) => registerCustomerService(mapCustomerRegisterFormToRequest(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerListKeys.all });
    },
  });
}
