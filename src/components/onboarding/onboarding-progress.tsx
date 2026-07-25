import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OnboardingProgressProps = {
  total: number;
  current: number;
};

export function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;
        const isPast = index < current;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor:
                  isActive ? theme.accent : isPast ? theme.textSecondary : theme.border,
                opacity: isActive ? 1 : isPast ? 0.55 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function OnboardingStepCounter({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <ThemedText type="label" themeColor="textSecondary">
      {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignSelf: 'stretch',
    height: 2,
  },
  segment: {
    flex: 1,
    height: 2,
  },
});
