import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
};

function getMetaTone(meta: string, theme: ReturnType<typeof useTheme>) {
  const normalized = meta.toLowerCase();

  if (normalized === 'high' || normalized === 'critical' || normalized === 'failed') {
    return { backgroundColor: theme.statusErrorBg, color: theme.error };
  }

  if (normalized === 'medium' || normalized === 'warning' || normalized === 'pending') {
    return { backgroundColor: theme.statusWarningBg, color: theme.warning };
  }

  if (normalized === 'low' || normalized === 'active' || normalized === 'delivered' || normalized === 'completed') {
    return { backgroundColor: theme.statusSuccessBg, color: theme.success };
  }

  return { backgroundColor: theme.backgroundElement, color: theme.textSecondary };
}

export function ListRow({ title, subtitle, meta, onPress }: ListRowProps) {
  const theme = useTheme();
  const metaTone = meta ? getMetaTone(meta, theme) : null;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.background,
          opacity: pressed && onPress ? 0.7 : 1,
        },
      ]}>
      <View style={styles.copy}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.trailing}>
        {meta && metaTone ? (
          <View style={[styles.metaBadge, { backgroundColor: metaTone.backgroundColor }]}>
            <ThemedText type="small" style={[styles.metaText, { color: metaTone.color }]}>
              {meta}
            </ThemedText>
          </View>
        ) : null}
        {onPress ? (
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            tintColor={theme.textSecondary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaBadge: {
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
