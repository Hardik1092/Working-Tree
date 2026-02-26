import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const MENU_ITEMS: { route: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { route: '/(tabs)/saved', label: 'Saved', icon: 'bookmark-outline' },
  { route: '/(tabs)/alerts', label: 'Alerts', icon: 'notifications-outline' },
  { route: '/(tabs)/messages', label: 'Messages', icon: 'chatbubbles-outline' },
  { route: '/(tabs)/market', label: 'Market', icon: 'pricetag-outline' },
  { route: '/(tabs)/weather', label: 'Weather', icon: 'partly-sunny-outline' },
  { route: '/(tabs)/network', label: 'Network', icon: 'people-outline' },
  { route: '/(tabs)/settings', label: 'Settings', icon: 'settings-outline' },
];

export default function MenuScreen() {
  const router = useRouter();
  const theme = colors.light;
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.foreground }]}>More</Text>
      {MENU_ITEMS.map(({ route, label, icon }) => (
        <TouchableOpacity
          key={route}
          style={[styles.row, { borderColor: theme.border }]}
          onPress={() => router.push(route as any)}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={22} color={theme.foreground} />
          <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>
          {label === 'Alerts' && unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={theme.muted} style={styles.chevron} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 20, fontWeight: '600', marginBottom: spacing.md, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16, marginLeft: spacing.sm, flex: 1 },
  badge: { borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  chevron: { marginLeft: spacing.xs },
});
