import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type QuickActionProps = {
  label: string;
  description?: string;
  icon: SymbolViewProps['name'];
  onPress?: () => void;
};

export function QuickAction({ label, description, icon, onPress }: QuickActionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.accentRoseMuted }]}>
        <SymbolView name={icon} size={18} tintColor={theme.accent} />
      </View>

      <View style={styles.copy}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {description}
          </ThemedText>
        ) : null}
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={14}
        tintColor={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
