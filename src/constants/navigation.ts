import type { SymbolViewProps } from 'expo-symbols';

export type AppTabRoute = 'home' | 'explore' | 'settings';

export type TabConfig = {
  label: string;
  icon: SymbolViewProps['name'];
  iconActive: SymbolViewProps['name'];
  iconInactive: SymbolViewProps['name'];
};

export const TAB_CONFIG: Record<AppTabRoute, TabConfig> = {
  home: {
    label: 'Home',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
    iconActive: { ios: 'house.fill', android: 'home', web: 'home' },
    iconInactive: { ios: 'house', android: 'home', web: 'home' },
  },
  explore: {
    label: 'Resources',
    icon: { ios: 'square.grid.2x2.fill', android: 'explore', web: 'explore' },
    iconActive: { ios: 'square.grid.2x2.fill', android: 'explore', web: 'explore' },
    iconInactive: { ios: 'square.grid.2x2', android: 'explore', web: 'explore' },
  },
  settings: {
    label: 'Settings',
    icon: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
    iconActive: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
    iconInactive: { ios: 'gearshape', android: 'settings', web: 'settings' },
  },
};

export const TAB_BAR_HEIGHT = 49;
export const TAB_BAR_SCROLL_PADDING = 8;

/** @deprecated Use TAB_BAR_HEIGHT */
export const FLOATING_TAB_BAR_HEIGHT = TAB_BAR_HEIGHT;

/** @deprecated Docked tab bar no longer uses floating margin */
export const FLOATING_TAB_BAR_MARGIN = 0;

export const DRAWER_WIDTH_RATIO = 0.88;

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, '') || '/';

  if (trimmed.endsWith('/index')) {
    return trimmed.slice(0, -'/index'.length) || '/';
  }

  return trimmed;
}

export function isTabRoute(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === '/home' || path === '/explore' || path === '/settings';
}

export function getScreenTitle(pathname: string): string {
  const path = normalizePathname(pathname);

  if (path === '/home') return 'Home';
  if (path === '/explore') return 'Resources';
  if (path === '/settings') return 'Settings';
  if (path === '/patients') return 'Patients';
  if (path === '/patients/new') return 'Add patient';
  if (path === '/chws') return 'CHWs';
  if (path === '/chws/new') return 'Add CHW';
  if (path === '/visits') return 'Visits';
  if (path === '/risk-flags') return 'Risk flags';
  if (path === '/sms') return 'SMS logs';
  if (path === '/clinic') return 'Clinic';
  if (path === '/team') return 'Team';

  const segment = path.split('/').filter(Boolean).pop();
  if (!segment) return 'mama-track';

  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export type DrawerMenuItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: SymbolViewProps['name'];
  section: 'operations' | 'people' | 'communications' | 'organization';
  supervisorOnly?: boolean;
};

export const DRAWER_MENU_SECTIONS = [
  { id: 'operations', label: 'Field operations' },
  { id: 'people', label: 'People' },
  { id: 'communications', label: 'Communications' },
  { id: 'organization', label: 'Organization' },
] as const;

export const DRAWER_MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: 'patients',
    label: 'Patients',
    description: 'Antenatal caseload and risk profiles',
    href: '/patients',
    icon: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
    section: 'operations',
  },
  {
    id: 'visits',
    label: 'Antenatal visits',
    description: 'Scheduled, completed, and missed visits',
    href: '/visits',
    icon: { ios: 'waveform.path.ecg', android: 'monitor_heart', web: 'monitor_heart' },
    section: 'operations',
  },
  {
    id: 'risk-flags',
    label: 'Risk flags',
    description: 'Open alerts and escalations',
    href: '/risk-flags',
    icon: {
      ios: 'exclamationmark.triangle.fill',
      android: 'warning',
      web: 'warning',
    },
    section: 'operations',
  },
  {
    id: 'chws',
    label: 'Community health workers',
    description: 'Field staff assigned to villages',
    href: '/chws',
    icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
    section: 'people',
    supervisorOnly: true,
  },
  {
    id: 'team',
    label: 'Supervisors',
    description: 'Clinic leadership and admin access',
    href: '/team',
    icon: { ios: 'person.crop.rectangle.stack', android: 'badge', web: 'badge' },
    section: 'people',
    supervisorOnly: true,
  },
  {
    id: 'sms',
    label: 'SMS logs',
    description: 'Reminders, alerts, and delivery status',
    href: '/sms',
    icon: { ios: 'message.fill', android: 'sms', web: 'sms' },
    section: 'communications',
  },
  {
    id: 'clinic',
    label: 'Clinic profile',
    description: 'Facility details and coverage area',
    href: '/clinic',
    icon: { ios: 'building.2.fill', android: 'local_hospital', web: 'local_hospital' },
    section: 'organization',
  },
];
