import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenShell } from '@/components/ui/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkspace } from '@/hooks/use-workspace';

export default function ClinicScreen() {
  const theme = useTheme();
  const { workspace } = useWorkspace();
  const clinic = workspace?.clinic;

  return (
    <ScreenShell subtitle="Facility details and coverage area">
      {!clinic ? (
        <EmptyState
          title="No clinic linked"
          description="Your account is not linked to a clinic record yet."
        />
      ) : (
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="section">{clinic.name}</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            {[clinic.lga, clinic.state].filter(Boolean).join(', ') || 'Location not set'}
          </ThemedText>
          {clinic.contactPhone ? (
            <ThemedText type="smallBold">{clinic.contactPhone}</ThemedText>
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            Registered {new Date(clinic.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    gap: Spacing.two,
  },
});
