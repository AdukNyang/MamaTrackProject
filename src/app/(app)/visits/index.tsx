import { useCallback } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

export default function VisitsScreen() {
  const visitsQueryFn = useCallback(() => api.antenatalVisits.listForWorkspace(), []);
  const patientsQueryFn = useCallback(() => api.patients.listForWorkspace(), []);
  const { data: visits, isLoading: visitsLoading } = useApiQuery(visitsQueryFn);
  const { data: patients } = useApiQuery(patientsQueryFn);

  const patientMap = new Map((patients ?? []).map((patient) => [patient._id, patient.fullName]));

  return (
    <ScreenShell subtitle="Scheduled, completed, and missed visits">
      {visitsLoading ? (
        <EmptyState title="Loading" description="Fetching visit records…" />
      ) : !visits || visits.length === 0 ? (
        <EmptyState
          title="No visits yet"
          description="Visits appear here once scheduled or logged for patients."
        />
      ) : (
        <ListGroup>
          {visits.map((visit) => (
            <ListRow
              key={visit._id}
              title={patientMap.get(visit.patientId) ?? 'Patient'}
              subtitle={
                visit.scheduledDate
                  ? `Scheduled ${visit.scheduledDate}`
                  : visit.completedDate
                    ? `Completed ${visit.completedDate}`
                    : 'No date recorded'
              }
              meta={visit.status}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
