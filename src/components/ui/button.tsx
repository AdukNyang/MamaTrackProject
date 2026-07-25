import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonIconPosition = 'leading' | 'trailing';
type ButtonSize = 'default' | 'compact';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: SymbolViewProps['name'];
  iconPosition?: ButtonIconPosition;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'default',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'leading',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.accent
      : variant === 'secondary'
        ? theme.backgroundElement
        : 'transparent';

  const textColor =
    variant === 'primary' ? theme.accentForeground : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        fullWidth && styles.fullWidth,
        {
          backgroundColor,
          borderColor: theme.border,
          borderRadius: size === 'compact' ? Radii.md : Layout.borderRadius,
          opacity: pressed && !isDisabled ? 0.9 : isDisabled ? 0.5 : 1,
        },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'leading' ? (
            <SymbolView name={icon} size={18} tintColor={textColor} />
          ) : null}
          <ThemedText
            type="smallBold"
            style={[styles.label, { color: textColor }]}>
            {label}
          </ThemedText>
          {icon && iconPosition === 'trailing' ? (
            <SymbolView name={icon} size={18} tintColor={textColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghost: {
    minHeight: 44,
    paddingHorizontal: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  label: {
    letterSpacing: 0.3,
  },
});
