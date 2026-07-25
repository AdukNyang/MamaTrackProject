import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/navigation/app-header';
import { getFloatingTabBarInset } from '@/components/navigation/floating-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type ScreenShellProps = ScrollViewProps & {
  subtitle?: string;
  action?: React.ReactNode;
  includeTabBarInset?: boolean;
  children: React.ReactNode;
};

export function ScreenShell({
  subtitle,
  action,
  includeTabBarInset = false,
  children,
  contentContainerStyle,
  ...scrollProps
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const topInset = Spacing.two;
  const bottomInset = includeTabBarInset
    ? getFloatingTabBarInset(insets.bottom)
    : Math.max(insets.bottom, Spacing.four);

  return (
    <ThemedView style={styles.container}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset, paddingBottom: bottomInset },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}>
        {subtitle || action ? (
          <View style={styles.intro}>
            {subtitle ? (
              <ThemedText type="body" themeColor="textSecondary" style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            ) : (
              <View style={styles.subtitleSpacer} />
            )}
            {action}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  subtitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitleSpacer: {
    flex: 1,
  },
});
