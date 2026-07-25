import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Dimensions, StyleSheet, View } from 'react-native';

import { AppDrawerContent } from '@/components/navigation/app-drawer';
import { DrawerStatusSync } from '@/components/navigation/drawer-status-sync';
import { DRAWER_WIDTH_RATIO } from '@/constants/navigation';
import { Colors } from '@/constants/theme';
import { DrawerControlsProvider, useDrawerControlsRef, useSetDrawerOpen } from '@/contexts/drawer-controls';
import { useAuth } from '@/contexts/auth-context';

const drawerWidth = Math.round(Dimensions.get('window').width * DRAWER_WIDTH_RATIO);

function AuthenticatedAppLayout() {
  const colors = Colors.light;
  const drawerControlsRef = useDrawerControlsRef();
  const setDrawerOpen = useSetDrawerOpen();

  return (
    <View style={styles.container}>
      <Drawer
        drawerContent={(props) => {
          drawerControlsRef.current = {
            openDrawer: () => {
              setDrawerOpen(true);
              props.navigation.openDrawer();
            },
            closeDrawer: () => {
              setDrawerOpen(false);
              props.navigation.closeDrawer();
            },
          };

          const closeDrawer = () => {
            setDrawerOpen(false);
            props.navigation.closeDrawer();
          };

          return (
            <>
              <DrawerStatusSync navigation={props.navigation} />
              <AppDrawerContent navigation={{ closeDrawer }} />
            </>
          );
        }}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: {
            width: drawerWidth,
            backgroundColor: colors.background,
          },
          overlayColor: 'rgba(30, 34, 53, 0.5)',
          swipeEnabled: true,
          swipeEdgeWidth: 48,
        }}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen name="patients/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="patients/new" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="chws/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="chws/new" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="visits/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="risk-flags/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="sms/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="clinic/index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="team/index" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <DrawerControlsProvider>
      <AuthenticatedAppLayout />
    </DrawerControlsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
