import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/navigation/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
