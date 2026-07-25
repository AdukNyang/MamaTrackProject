import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ActivityRow } from '@/components/home/activity-row';
import { QuickAction } from '@/components/home/quick-action';
import { StatCard } from '@/components/home/stat-card';
import { ScreenShell } from '@/components/ui/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useTheme } from '@/hooks/use-theme';
import { useWorkspace } from '@/hooks/use-workspace';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isSupervisor } = useWorkspace();
  const overviewQueryFn = useCallback(() => api.dashboard.getOverview(), []);
  const activityQueryFn = useCallback(() => api.dashboard.listRecentActivity(), []);
  const { data: overview } = useApiQuery(overviewQueryFn);
  const { data: recentActivity } = useApiQuery(activityQueryFn);

  return (
    <ScreenShell
      subtitle="Clinic overview and recent activity"
      includeTabBarInset>
      <View style={[styles.statsGrid, { backgroundColor: theme.border }]}>
        <View style={styles.statsRow}>
          <StatCard label="Patients" value={String(overview?.patients ?? 0)} />
          <View style={[styles.statsDividerV, { backgroundColor: theme.border }]} />
          <StatCard label="CHWs" value={String(overview?.chws ?? 0)} />
        </View>
        <View style={[styles.statsDividerH, { backgroundColor: theme.border }]} />
        <View style={styles.statsRow}>
          <StatCard label="Open flags" value={String(overview?.openFlags ?? 0)} />
          <View style={[styles.statsDividerV, { backgroundColor: theme.border }]} />
          <StatCard
            label="Scheduled"
            value={String(overview?.scheduledVisits ?? 0)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="label" themeColor="textSecondary">
          Quick actions
        </ThemedText>
        <View style={styles.sectionContent}>
          <QuickAction
            label="Patients"
            description="View antenatal caseload"
            icon={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
            onPress={() => router.push('/patients')}
          />
          {isSupervisor ? (
            <QuickAction
              label="Add patient"
              description="Register a new case"
              icon={{ ios: 'plus.circle.fill', android: 'person_add', web: 'person_add' }}
              onPress={() => router.push('/patients/new')}
            />
          ) : null}
          <QuickAction
            label="Visits"
            description="Scheduled and completed visits"
            icon={{
              ios: 'waveform.path.ecg',
              android: 'monitor_heart',
              web: 'monitor_heart',
            }}
            onPress={() => router.push('/visits')}
          />
          <QuickAction
            label="Risk flags"
            description="Open alerts needing attention"
            icon={{
              ios: 'exclamationmark.triangle.fill',
              android: 'warning',
              web: 'warning',
            }}
            onPress={() => router.push('/risk-flags')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="label" themeColor="textSecondary">
          Recent activity
        </ThemedText>
        <View
          style={[
            styles.sectionContent,
            styles.activityCard,
            { borderColor: theme.border },
          ]}>
          {(recentActivity ?? []).length === 0 ? (
            <ThemedText
              type="body"
              themeColor="textSecondary"
              style={styles.emptyActivity}>
              No recent activity yet.
            </ThemedText>
          ) : (
            (recentActivity ?? []).map((item, index) => (
              <View
                key={item.id}
                style={
                  index < (recentActivity?.length ?? 0) - 1
                    ? {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.border,
                      }
                    : undefined
                }>
                <ActivityRow
                  title={item.title}
                  subtitle={item.subtitle}
                  meta={item.meta}
                />
              </View>
            ))
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsDividerV: {
    width: StyleSheet.hairlineWidth,
  },
  statsDividerH: {
    height: StyleSheet.hairlineWidth,
  },
  section: {
    gap: Spacing.two,
  },
  sectionContent: {
    gap: Spacing.two,
  },
  activityCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  emptyActivity: {
    padding: Spacing.three,
  },
});
