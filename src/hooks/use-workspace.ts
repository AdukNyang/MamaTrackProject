import { useCallback } from 'react';

import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

export function useWorkspace() {
  const queryFn = useCallback(() => api.dashboard.getWorkspace(), []);
  const { data: workspace, isLoading } = useApiQuery(queryFn);

  return {
    workspace,
    isLoading,
    isSupervisor: workspace?.role === 'supervisor',
    isChw: workspace?.role === 'chw',
    clinicId: workspace?.clinicId ?? null,
  };
}
