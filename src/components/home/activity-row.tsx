import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActivityRowProps = {
  title: string;
  subtitle: string;
  meta: string;
  onPress?: () => void;
};

export function ActivityRow({ title, subtitle, meta, onPress }: ActivityRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.background,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.copy}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </View>
      <View style={styles.meta}>
        <ThemedText type="label" themeColor="textSecondary">
          {meta}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={14}
          tintColor={theme.textSecondary}
        />
      </View>
    </Pressable>
  );
}

type ActivityListProps = {
  items: ActivityRowProps[];
};

export function ActivityList({ items }: ActivityListProps) {
  const theme = useTheme();

  return (
    <View style={[styles.list, { borderColor: theme.border }]}>
      {items.map((item, index) => (
        <View
          key={item.title}
          style={index < items.length - 1 ? { borderBottomWidth: 1, borderBottomColor: theme.border } : undefined}>
          <ActivityRow {...item} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: Spacing.half,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
