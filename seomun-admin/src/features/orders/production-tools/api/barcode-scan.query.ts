import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';
import { orderKeys } from '@/features/orders/api/order.query';

import type { BarcodeScanREQ } from './barcode-scan.request';
import type { BarcodeScanRESP } from './barcode-scan.response';
import { scanBarcode } from './barcode-scan.service';

export const productionToolsKeys = {
  all: ['production-tools'] as const,
  scans: () => [...productionToolsKeys.all, 'scans'] as const,
};

export function useBarcodeScanMutation(options?: UseMutationOptions<BarcodeScanRESP, AxiosError<IBaseError>, BarcodeScanREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: scanBarcode,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
