/**
 * MamaTrack design tokens — Soft Indigo & Rose palette.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E2235',
    textSecondary: '#6B7289',
    background: '#F8F7FC',
    backgroundElement: '#F0EEF8',
    backgroundSelected: '#E4E0F4',
    border: '#E2DFF0',
    accent: '#5B6ABF',
    accentForeground: '#FFFFFF',
    accentRose: '#C45C8E',
    accentRoseForeground: '#FFFFFF',
    accentRoseMuted: '#F8E8F0',
    success: '#3D9A6E',
    error: '#D6455A',
    warning: '#D4923A',
    statusSuccessBg: '#EBF7F1',
    statusWarningBg: '#FDF4E8',
    statusErrorBg: '#FCEAEE',
  },
  dark: {
    text: '#F4F3FA',
    textSecondary: '#A8A5C4',
    background: '#15152A',
    backgroundElement: '#1E1E38',
    backgroundSelected: '#2A2A4A',
    border: '#2E2E4A',
    accent: '#7B8AD4',
    accentForeground: '#FFFFFF',
    accentRose: '#E07AAB',
    accentRoseForeground: '#FFFFFF',
    accentRoseMuted: '#3D2440',
    success: '#4BB88A',
    error: '#F06B7E',
    warning: '#E8AD56',
    statusSuccessBg: '#1A3D2E',
    statusWarningBg: '#3D3018',
    statusErrorBg: '#3D1A24',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
};

export const Typography = {
  hero: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  section: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 2.2,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Layout = {
  borderRadius: 0,
  maxContentWidth: 480,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** @deprecated Use Layout.maxContentWidth */
export const MaxContentWidth = Layout.maxContentWidth;
