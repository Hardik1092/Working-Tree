import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { MainHeader } from '@/components/navigation/MainHeader';

const theme = colors.light;
const TAB_BAR_HEIGHT = 70;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: (props: { navigation: { getParent: () => { openDrawer?: () => void } | null } }) => (
          <MainHeader openDrawer={() => props.navigation?.getParent()?.openDrawer?.()} />
        ),
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.border,
          height: TAB_BAR_HEIGHT,
          width: '100%',
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'KrishiConnect',
          headerShown: true,
          header: (props: { navigation: { getParent: () => { openDrawer?: () => void } | null } }) => (
            <MainHeader openDrawer={() => props.navigation?.getParent()?.openDrawer?.()} />
          ),
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Krishi Assistant',
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New Post',
          tabBarLabel: 'Add Post',
          tabBarIcon: ({ color, size }) => <Ionicons name="add" size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarLabel: 'News',
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen name="menu" options={{ title: 'More', tabBarButton: () => null }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarButton: () => null }} />
      <Tabs.Screen name="market" options={{ title: 'Market', tabBarButton: () => null }} />
      <Tabs.Screen name="weather" options={{ title: 'Weather', tabBarButton: () => null }} />
      <Tabs.Screen name="network" options={{ title: 'Network', tabBarButton: () => null }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarButton: () => null }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarButton: () => null }} />
      <Tabs.Screen name="opportunities" options={{ title: 'Opportunities', tabBarButton: () => null }} />
      <Tabs.Screen name="crop-doctor" options={{ title: 'Crop Doctor', tabBarButton: () => null }} />
    </Tabs>
  );
}
