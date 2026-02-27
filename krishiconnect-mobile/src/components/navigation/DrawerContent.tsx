import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/common/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type DrawerItemConfig = {
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: 'exclamation';
};

const MAIN_ITEMS: DrawerItemConfig[] = [
  { route: '/(drawer)/(tabs)/home', label: 'Home', icon: 'home-outline' },
  { route: '/(drawer)/(tabs)/network', label: 'Network', icon: 'people-outline' },
  { route: '/(drawer)/(tabs)/opportunities', label: 'Opportunities', icon: 'briefcase-outline', badge: 'exclamation' },
  { route: '/(drawer)/(tabs)/messages', label: 'Messages', icon: 'chatbubble-outline' },
  { route: '/(drawer)/(tabs)/alerts', label: 'Alerts', icon: 'notifications-outline' },
  { route: '/(drawer)/(tabs)/weather', label: 'Weather', icon: 'partly-sunny-outline' },
  { route: '/(drawer)/(tabs)/market', label: 'Market', icon: 'pricetag-outline' },
  { route: '/(drawer)/(tabs)/crop-doctor', label: 'Crop Doctor', icon: 'leaf-outline' },
  { route: '/(drawer)/(tabs)/profile', label: 'Profile', icon: 'person-outline' },
];

const SETTINGS_ITEM: DrawerItemConfig = {
  route: '/(drawer)/(tabs)/settings',
  label: 'Settings',
  icon: 'settings-outline',
};

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = colors.light;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const unreadCount = (queryClient.getQueryData(['notifications', 'unreadCount']) as number | undefined) ?? 0;

  const isActive = (route: string) => {
    const base = route.replace('/(drawer)/(tabs)/', '');
    if (base === 'home') return pathname === '/(drawer)/(tabs)/home' || pathname.endsWith('/home');
    if (base === 'profile') return pathname.includes('/(drawer)/(tabs)/profile');
    if (base === 'messages') return pathname.includes('/(drawer)/(tabs)/messages');
    return pathname.includes(base);
  };

  const renderItem = ({ route, label, icon, badge }: DrawerItemConfig) => {
    const active = isActive(route);
    const showBadge = label === 'Opportunities' && badge === 'exclamation' && unreadCount > 0;

    return (
      <TouchableOpacity
        key={route}
        style={[
          styles.row,
          active && { backgroundColor: styles.activeRow.backgroundColor as string },
        ]}
        onPress={() => {
          props.navigation.closeDrawer();
          router.push(route as any);
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={22}
          color={active ? theme.primary : theme.muted}
        />
        <Text
          style={[
            styles.label,
            { color: active ? theme.primary : theme.muted },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {showBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>!</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.menu}>
          {MAIN_ITEMS.map(renderItem)}
        </View>

        <View style={styles.bottomArea}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.menu}>
            {renderItem(SETTINGS_ITEM)}
          </View>

          {user ? (
            <TouchableOpacity
              style={[styles.userRow, { borderTopColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => {
                props.navigation.closeDrawer();
                router.push('/(drawer)/(tabs)/profile');
              }}
            >
              <Avatar
                uri={
                  typeof user.avatar === 'string'
                    ? user.avatar
                    : (user as { avatar?: { url?: string } })?.avatar?.url
                }
                name={user.name ?? 'User'}
                size={36}
              />
              <Text style={[styles.userName, { color: theme.primary }]} numberOfLines={1}>
                {user.name ?? 'User'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  content: { flex: 1 },
  menu: { paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginVertical: 4,
  },
  activeRow: {
    backgroundColor: '#EAF7EE',
  },
  label: { fontSize: 16, marginLeft: 14, flex: 1, fontWeight: '500' },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: -1 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  bottomArea: {
    marginTop: 'auto',
    paddingBottom: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  userName: { fontSize: 16, fontWeight: '700', marginLeft: 12 },
});
