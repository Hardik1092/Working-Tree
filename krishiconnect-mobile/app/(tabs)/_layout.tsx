import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

const theme = colors.light;
const TAB_BAR_HEIGHT = 72;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
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
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: theme.foreground },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'KrishiConnect',
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New Post',
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => <Ionicons name="add" size={size ?? 26} color={color} />,
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'More',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarButton: () => null }} />
      <Tabs.Screen name="market" options={{ title: 'Market', tabBarButton: () => null }} />
      <Tabs.Screen name="weather" options={{ title: 'Weather', tabBarButton: () => null }} />
      <Tabs.Screen name="network" options={{ title: 'Network', tabBarButton: () => null }} />
      <Tabs.Screen
        name="alerts"
        options={{ title: 'Alerts', tabBarButton: () => null }}
      />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarButton: () => null }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarButton: () => null }} />
    </Tabs>
  );
}
