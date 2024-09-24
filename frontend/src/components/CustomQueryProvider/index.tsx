import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { useNavigateContext } from '../../contexts/NavigationContext';

const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404];
const MAX_RETRIES = 3;

// Function to generate a QueryClient with error handling
// and redirect, this will guarantee the redirect for all
// requests in the application
const useCustomQueryClient = () => {
  const { redirectTo403 } = useNavigateContext();

  const queryClient = new QueryClient(
    {
      defaultOptions: {
        queries: {
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          // Do not retry on errors defined above
          retry: (failureCount, error) => {
            if (failureCount > MAX_RETRIES) {
              return false;
            }
            if (isAxiosError(error)) {
              const status = error.response?.status;
              if (status && HTTP_STATUS_TO_NOT_RETRY.includes(status)) {
                if (status === 403) {
                  redirectTo403();
                }
                return false;
              }
            }
            return true;
          }
        }
      }
    }
  );

  return queryClient;
};

interface CustomQueryProviderProps {
  children: ReactNode;
}

const CustomQueryProvider = ({ children }: CustomQueryProviderProps) => {
  const queryClient = useCustomQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default CustomQueryProvider;
