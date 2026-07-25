import { useCallback } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useWorkspace } from '@/hooks/use-workspace';

export default function TeamScreen() {
  const { clinicId } = useWorkspace();
  const queryFn = useCallback(
    () => (clinicId ? api.supervisors.listByClinic(clinicId) : Promise.resolve([])),
    [clinicId],
  );
  const { data: supervisors, isLoading } = useApiQuery(queryFn, Boolean(clinicId));

  return (
    <ScreenShell subtitle="Clinic leadership and admin access">
      {isLoading ? (
        <EmptyState title="Loading" description="Fetching supervisor records…" />
      ) : !supervisors || supervisors.length === 0 ? (
        <EmptyState
          title="No supervisors"
          description="Supervisor accounts for this clinic will appear here."
        />
      ) : (
        <ListGroup>
          {supervisors.map((supervisor) => (
            <ListRow
              key={supervisor._id}
              title={supervisor.fullName}
              subtitle={supervisor.email ?? supervisor.phone ?? supervisor.role}
              meta={supervisor.isActive ? 'Active' : 'Inactive'}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
