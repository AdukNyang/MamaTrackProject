import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgress, OnboardingStepCounter } from '@/components/onboarding/onboarding-progress';
import { OnboardingSlideView } from '@/components/onboarding/onboarding-slide';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { onboardingSlides } from '@/constants/onboarding';
import { Spacing } from '@/constants/theme';
import { setOnboardingComplete } from '@/lib/onboarding-storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slide = onboardingSlides[currentIndex];
  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const finishOnboarding = useCallback(async () => {
    await setOnboardingComplete();
    router.replace('/login');
  }, [router]);

  const goToNext = useCallback(() => {
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }

    setCurrentIndex((index) => index + 1);
  }, [finishOnboarding, isLastSlide]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <OnboardingStepCounter
            current={currentIndex}
            total={onboardingSlides.length}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void finishOnboarding();
            }}
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <ThemedText type="small" themeColor="textSecondary">
              Skip
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.slideArea}>
          <Animated.View
            key={slide.id}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(120)}
            style={styles.slide}>
            <OnboardingSlideView slide={slide} />
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <OnboardingProgress total={onboardingSlides.length} current={currentIndex} />

          <View style={styles.actions}>
            {currentIndex > 0 ? (
              <Button
                label="Back"
                variant="ghost"
                icon={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                iconPosition="leading"
                onPress={goToPrevious}
              />
            ) : (
              <View style={styles.actionSpacer} />
            )}
            <View style={styles.primaryAction}>
              <Button
                label={isLastSlide ? 'Get Started' : 'Continue'}
                fullWidth
                icon={
                  isLastSlide
                    ? { ios: 'checkmark', android: 'check', web: 'check' }
                    : { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }
                }
                iconPosition="trailing"
                onPress={goToNext}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  skip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  slideArea: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  footer: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionSpacer: {
    width: 72,
  },
  primaryAction: {
    flex: 1,
  },
});
