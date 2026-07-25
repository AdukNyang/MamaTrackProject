import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'hero'
    | 'section'
    | 'label'
    | 'body'
    | 'bodyLarge'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily: Fonts.sansMedium },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'hero' && styles.hero,
        type === 'section' && styles.section,
        type === 'label' && styles.label,
        type === 'body' && styles.body,
        type === 'bodyLarge' && styles.bodyLarge,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...Typography.body,
    fontFamily: Fonts.sansMedium,
  },
  title: {
    ...Typography.hero,
    fontFamily: Fonts.sansBold,
  },
  hero: {
    ...Typography.hero,
    fontFamily: Fonts.sansBold,
  },
  section: {
    ...Typography.section,
    fontFamily: Fonts.sansBold,
  },
  label: {
    ...Typography.label,
    fontFamily: Fonts.sansMedium,
  },
  body: {
    ...Typography.body,
    fontFamily: Fonts.sans,
  },
  bodyLarge: {
    ...Typography.bodyLarge,
    fontFamily: Fonts.sans,
  },
  small: {
    ...Typography.small,
    fontFamily: Fonts.sansMedium,
  },
  smallBold: {
    ...Typography.smallBold,
    fontFamily: Fonts.sansBold,
  },
  subtitle: {
    ...Typography.section,
    fontFamily: Fonts.sansBold,
  },
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sansMedium,
    textDecorationLine: 'underline',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' as const }) ?? '500',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
