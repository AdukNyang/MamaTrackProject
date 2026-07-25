import { useCallback } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

export default function SmsScreen() {
  const logsQueryFn = useCallback(() => api.smsLogs.listForWorkspace(), []);
  const patientsQueryFn = useCallback(() => api.patients.listForWorkspace(), []);
  const { data: logs, isLoading } = useApiQuery(logsQueryFn);
  const { data: patients } = useApiQuery(patientsQueryFn);

  const patientMap = new Map((patients ?? []).map((patient) => [patient._id, patient.fullName]));

  return (
    <ScreenShell subtitle="Reminders, alerts, and delivery status">
      {isLoading ? (
        <EmptyState title="Loading" description="Fetching SMS logs…" />
      ) : !logs || logs.length === 0 ? (
        <EmptyState
          title="No SMS logs"
          description="Outbound messages to patients will be recorded here."
        />
      ) : (
        <ListGroup>
          {logs.map((log) => (
            <ListRow
              key={log._id}
              title={log.patientId ? (patientMap.get(log.patientId) ?? log.recipientPhone) : log.recipientPhone}
              subtitle={log.messageBody.slice(0, 80)}
              meta={log.deliveryStatus}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
