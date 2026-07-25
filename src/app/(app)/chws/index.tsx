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

export default function ChwsScreen() {
  const router = useRouter();
  const { clinicId } = useWorkspace();
  const queryFn = useCallback(
    () => (clinicId ? api.chwUsers.listByClinic(clinicId) : Promise.resolve([])),
    [clinicId],
  );
  const { data: chws, isLoading } = useApiQuery(queryFn, Boolean(clinicId));

  return (
    <ScreenShell
      subtitle="Field staff assigned to villages"
      action={
        <Button
          label="Add"
          variant="secondary"
          size="compact"
          icon={{ ios: 'plus', android: 'add', web: 'add' }}
          onPress={() => router.push('/chws/new')}
        />
      }>
      {isLoading ? (
        <EmptyState title="Loading" description="Fetching CHW records…" />
      ) : !chws || chws.length === 0 ? (
        <EmptyState
          title="No CHWs yet"
          description="Add community health workers to assign patients and visits."
        />
      ) : (
        <ListGroup>
          {chws.map((chw) => (
            <ListRow
              key={chw._id}
              title={chw.fullName}
              subtitle={chw.villageArea ?? chw.phone ?? 'No details'}
              meta={chw.status}
            />
          ))}
        </ListGroup>
      )}
    </ScreenShell>
  );
}
