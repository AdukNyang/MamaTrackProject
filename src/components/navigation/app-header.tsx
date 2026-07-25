import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getScreenTitle, isTabRoute, normalizePathname } from '@/constants/navigation';
import { Colors, Spacing } from '@/constants/theme';
import { useDrawerControlsRef, useSetDrawerOpen } from '@/contexts/drawer-controls';

export const APP_HEADER_CONTENT_HEIGHT = 44;

export function getAppHeaderInset(safeAreaTop: number) {
  return safeAreaTop + APP_HEADER_CONTENT_HEIGHT;
}

function BackIcon({ color }: { color: string }) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name="chevron.left"
        size={20}
        weight="semibold"
        tintColor={color}
      />
    );
  }

  return (
    <SymbolView
      name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
      size={22}
      tintColor={color}
    />
  );
}

export function AppHeader() {
  const router = useRouter();
  const drawerControlsRef = useDrawerControlsRef();
  const setDrawerOpen = useSetDrawerOpen();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = Colors.light;
  const normalizedPath = normalizePathname(pathname);
  const showBack = !isTabRoute(normalizedPath);
  const title = getScreenTitle(normalizedPath);

  useEffect(() => {
    setDrawerOpen(false);
  }, [normalizedPath, setDrawerOpen]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  };

  const handleMenuPress = () => {
    drawerControlsRef.current.openDrawer();
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        Platform.OS === 'ios' && styles.wrapperShadow,
      ]}>
      <View style={styles.inner}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            hitSlop={8}
            style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}>
            <BackIcon color={colors.text} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={handleMenuPress}
            hitSlop={8}
            style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}>
            <SymbolView
              name={{
                ios: 'line.3.horizontal',
                android: 'menu',
                web: 'menu',
              }}
              size={22}
              tintColor={colors.text}
            />
          </Pressable>
        )}

        <View pointerEvents="none" style={styles.titleWrap}>
          <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>

        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wrapperShadow: {
    shadowColor: '#1E2235',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
  },
  inner: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: APP_HEADER_CONTENT_HEIGHT,
    paddingHorizontal: Spacing.two,
  },
  sideButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleWrap: {
    position: 'absolute',
    left: 48,
    right: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.55,
  },
});
