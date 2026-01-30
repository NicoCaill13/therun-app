import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { getQueryClient } from './queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query provider wrapper.
 * Wraps the app with QueryClientProvider using our configured client.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
