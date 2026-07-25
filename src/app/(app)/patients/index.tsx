import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useWorkspace } from '@/hooks/use-workspace';

export default function PatientsScreen() {
  const router = useRouter();
  const { isSupervisor } = useWorkspace();
  const queryFn = useCallback(() => api.patients.listForWorkspace(), []);
  const { data: patients, isLoading } = useApiQuery(queryFn);

  return (
    <ScreenShell
      subtitle="Antenatal caseload and risk profiles"
      action={
        isSupervisor ? (
          <Button
            label="Add"
            variant="secondary"
            size="compact"
            icon={{ ios: 'plus', android: 'add', web: 'add' }}
            onPress={() => router.push('/patients/new')}
          />
        ) : null
      }>
      {isLoading ? (
        <EmptyState title="Loading" description="Fetching patient records…" />
      ) : !patients || patients.length === 0 ? (
        <EmptyState
          title="No patients yet"
          description="Add your first patient to start tracking antenatal care."
        />
      ) : (
        <ListGroup>
          {patients.map((patient) => (
            <ListRow
              key={patient._id}
              title={patient.fullName}
              subtitle={[patient.village, patient.phone].filter(Boolean).join(' · ') || 'No contact info'}
              meta={patient.riskLevel}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
