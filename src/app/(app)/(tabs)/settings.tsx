import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ListGroup } from '@/components/ui/list-group';
import { ListRow } from '@/components/ui/list-row';
import { ScreenShell } from '@/components/ui/screen-shell';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useAuthActions } from '@/contexts/auth-context';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useTheme } from '@/hooks/use-theme';
import { useWorkspace } from '@/hooks/use-workspace';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signOut } = useAuthActions();
  const { workspace } = useWorkspace();
  const { data: viewer } = useApiQuery(() => api.users.viewer());

  const displayName =
    workspace?.supervisor?.fullName ?? workspace?.chw?.fullName ?? viewer?.user?.name ?? 'User';
  const email = viewer?.user?.email ?? workspace?.supervisor?.email ?? 'No email on file';
  const roleLabel =
    workspace?.role === 'supervisor'
      ? 'Clinic supervisor'
      : workspace?.role === 'chw'
        ? 'Community health worker'
        : 'Unlinked account';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScreenShell subtitle="Profile and account" includeTabBarInset>
      <View style={[styles.profileCard, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="label" themeColor="textSecondary">
          Signed in as
        </ThemedText>
        <ThemedText type="section">{displayName}</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          {email}
        </ThemedText>
        <ThemedText type="smallBold">{roleLabel}</ThemedText>
        {workspace?.clinic ? (
          <ThemedText type="small" themeColor="textSecondary">
            {workspace.clinic.name}
            {workspace.clinic.lga ? ` · ${workspace.clinic.lga}` : ''}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="label" themeColor="textSecondary">
          Account
        </ThemedText>
        <ListGroup>
          <ListRow
            title="Clinic profile"
            subtitle="Facility details and coverage"
            onPress={() => router.push('/clinic')}
          />
        </ListGroup>
      </View>

      <Button
        label="Sign out"
        variant="secondary"
        fullWidth
        icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
        onPress={() => void handleSignOut()}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
});
