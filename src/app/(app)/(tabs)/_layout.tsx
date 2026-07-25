import { Tabs } from 'expo-router';

import { FloatingTabBar, type FloatingTabBarProps } from '@/components/navigation/floating-tab-bar';
import { TAB_CONFIG } from '@/constants/navigation';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as FloatingTabBarProps)} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: TAB_CONFIG.home.label,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: TAB_CONFIG.explore.label,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: TAB_CONFIG.settings.label,
        }}
      />
    </Tabs>
  );
}
