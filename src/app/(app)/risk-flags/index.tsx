import { useCallback } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

export default function RiskFlagsScreen() {
  const flagsQueryFn = useCallback(() => api.riskFlags.listForWorkspace(), []);
  const patientsQueryFn = useCallback(() => api.patients.listForWorkspace(), []);
  const { data: flags, isLoading } = useApiQuery(flagsQueryFn);
  const { data: patients } = useApiQuery(patientsQueryFn);

  const patientMap = new Map((patients ?? []).map((patient) => [patient._id, patient.fullName]));

  return (
    <ScreenShell subtitle="Open alerts and escalations">
      {isLoading ? (
        <EmptyState title="Loading" description="Fetching risk flags…" />
      ) : !flags || flags.length === 0 ? (
        <EmptyState
          title="No open flags"
          description="Risk flags raised by CHWs will appear here for follow-up."
        />
      ) : (
        <ListGroup>
          {flags.map((flag) => (
            <ListRow
              key={flag._id}
              title={patientMap.get(flag.patientId) ?? 'Patient'}
              subtitle={flag.description ?? flag.flagType}
              meta={flag.severity}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
