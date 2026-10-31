import { QueryCache, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) return;

      if (axios.isAxiosError(error)) {
        if (!error.response) return;

        if (error.response.status >= 500) {
          toast.error('Server error. Please try again.');
        }
      }
    },
  }),

  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401) return false;
          if (status && status >= 400 && status < 500) return false;
        }

        return failureCount < 2;
      },
    },
  },
});
