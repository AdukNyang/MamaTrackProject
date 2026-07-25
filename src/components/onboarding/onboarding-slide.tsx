import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Layout, Spacing } from '@/constants/theme';
import type { OnboardingSlide } from '@/constants/onboarding';
import { useTheme } from '@/hooks/use-theme';

type OnboardingSlideViewProps = {
  slide: OnboardingSlide;
};

export function OnboardingSlideView({ slide }: OnboardingSlideViewProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.illustrationFrame,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <Image
          source={slide.illustration}
          style={styles.illustration}
          contentFit="cover"
          accessibilityLabel={`${slide.label} illustration`}
        />
        <View
          style={[
            styles.stepBadge,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <ThemedText type="label" themeColor="textSecondary">
            {slide.step}
          </ThemedText>
        </View>
      </View>

      <View style={styles.copy}>
        <ThemedText type="label" themeColor="textSecondary">
          {slide.label}
        </ThemedText>

        <ThemedText type="hero" style={styles.title}>
          {slide.title}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  illustrationFrame: {
    flex: 1,
    minHeight: 260,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  stepBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
  },
  copy: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    maxWidth: 340,
  },
});
