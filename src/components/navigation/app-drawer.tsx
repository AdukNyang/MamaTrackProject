import { useCallback } from 'react';
import { type Href, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  DRAWER_MENU_ITEMS,
  DRAWER_MENU_SECTIONS,
  type DrawerMenuItem,
} from '@/constants/navigation';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { api } from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

type AppDrawerContentProps = {
  navigation: {
    closeDrawer: () => void;
  };
};

function getInitials(name?: string | null) {
  if (!name) return 'MT';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppDrawerContent({ navigation }: AppDrawerContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = Colors.light;
  const queryFn = useCallback(() => api.dashboard.getWorkspace(), []);
  const { data: workspace } = useApiQuery(queryFn);
  const isSupervisor = workspace?.role === 'supervisor';

  const visibleItems = DRAWER_MENU_ITEMS.filter(
    (item) => !item.supervisorOnly || isSupervisor,
  );

  const displayName =
    workspace?.supervisor?.fullName ??
    workspace?.chw?.fullName ??
    'Signed in user';
  const clinicName = workspace?.clinic?.name ?? 'Clinic workspace';
  const roleLabel =
    workspace?.role === 'supervisor'
      ? 'Clinic supervisor'
      : workspace?.role === 'chw'
        ? 'Community health worker'
        : 'Unlinked account';

  const handleNavigate = (item: DrawerMenuItem) => {
    navigation.closeDrawer();
    router.push(item.href as Href);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.profileCard,
          {
            paddingTop: insets.top + Spacing.three,
            backgroundColor: colors.backgroundElement,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <ThemedText
              type="smallBold"
              style={{ color: colors.accentForeground, fontSize: 16 }}>
              {getInitials(displayName)}
            </ThemedText>
          </View>

          <View style={styles.profileCopy}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {clinicName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {displayName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {roleLabel}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={navigation.closeDrawer}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.background },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
              tintColor={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.menu,
          { paddingBottom: Math.max(insets.bottom, Spacing.four) },
        ]}
        showsVerticalScrollIndicator={false}>
        {DRAWER_MENU_SECTIONS.map((section) => {
          const sectionItems = visibleItems.filter((item) => item.section === section.id);
          if (sectionItems.length === 0) {
            return null;
          }

          return (
            <View key={section.id} style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary" style={styles.sectionLabel}>
                {section.label}
              </ThemedText>

              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}>
                {sectionItems.map((item, index) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => handleNavigate(item)}
                    style={({ pressed }) => [
                      styles.item,
                      index < sectionItems.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: colors.accentRoseMuted },
                      ]}>
                      <SymbolView name={item.icon} size={18} tintColor={colors.accent} />
                    </View>

                    <View style={styles.itemCopy}>
                      <ThemedText type="smallBold">{item.label}</ThemedText>
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        numberOfLines={1}>
                        {item.description}
                      </ThemedText>
                    </View>

                    <SymbolView
                      name={{
                        ios: 'chevron.right',
                        android: 'chevron_right',
                        web: 'chevron_right',
                      }}
                      size={14}
                      tintColor={colors.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.one,
    letterSpacing: 1.4,
  },
  sectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
