import { useEffect } from 'react';

import { useSetDrawerOpen } from '@/contexts/drawer-controls';

type DrawerNavigation = {
  addListener: (event: 'drawerOpen' | 'drawerClose', callback: () => void) => () => void;
};

type DrawerStatusSyncProps = {
  navigation: DrawerNavigation;
};

export function DrawerStatusSync({ navigation }: DrawerStatusSyncProps) {
  const setDrawerOpen = useSetDrawerOpen();

  useEffect(() => {
    const unsubscribeOpen = navigation.addListener('drawerOpen', () => {
      setDrawerOpen(true);
    });
    const unsubscribeClose = navigation.addListener('drawerClose', () => {
      setDrawerOpen(false);
    });

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, [navigation, setDrawerOpen]);

  return null;
}
