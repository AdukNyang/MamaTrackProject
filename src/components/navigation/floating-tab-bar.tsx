import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_SCROLL_PADDING,
  TAB_CONFIG,
  type AppTabRoute,
} from '@/constants/navigation';
import { Colors, Spacing } from '@/constants/theme';

export type FloatingTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = Colors.light;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        Platform.OS === 'ios' && styles.wrapperShadow,
      ]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const routeName = route.name as AppTabRoute;
          const config = TAB_CONFIG[routeName];
          if (!config) {
            return null;
          }

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <View
                style={[
                  styles.iconWrap,
                  isFocused && {
                    backgroundColor: colors.accentRoseMuted,
                  },
                ]}>
                <SymbolView
                  name={isFocused ? config.iconActive : config.iconInactive}
                  size={22}
                  tintColor={isFocused ? colors.accent : colors.textSecondary}
                />
              </View>
              <ThemedText
                type={isFocused ? 'smallBold' : 'small'}
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: isFocused ? colors.accent : colors.textSecondary },
                ]}>
                {config.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function getTabBarInset(safeAreaBottom: number) {
  return TAB_BAR_HEIGHT + safeAreaBottom + TAB_BAR_SCROLL_PADDING;
}

/** @deprecated Use getTabBarInset */
export function getFloatingTabBarInset(safeAreaBottom: number) {
  return getTabBarInset(safeAreaBottom);
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  wrapperShadow: {
    shadowColor: '#1E2235',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: TAB_BAR_HEIGHT,
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: Spacing.one,
  },
  iconWrap: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  label: {
    fontSize: Platform.select({ ios: 10, android: 12, default: 11 }),
    lineHeight: Platform.select({ ios: 12, android: 14, default: 13 }),
    letterSpacing: Platform.select({ ios: 0.1, android: 0, default: 0 }),
  },
  pressed: {
    opacity: 0.65,
  },
});
