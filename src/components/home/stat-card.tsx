import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <ThemedText type="smallBold" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText type="label" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  label: {
    letterSpacing: 1.2,
  },
});
