import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { FeedList } from './FeedList';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const HEADER_PADDING_VERTICAL = 12;
const ICON_GAP = 16;

export function HomeScreen() {
  const router = useRouter();
  const theme = colors.light;
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <Text style={[styles.logo, { color: theme.foreground }]} numberOfLines={1}>
            KrishiConnect
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
            onPress={() => router.push('/(tabs)/alerts')}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.foreground} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/messages')}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/menu')}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={22} color={theme.foreground} />
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      <FeedList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeHeader: { backgroundColor: colors.light.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: HEADER_PADDING_VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border,
  },
  logo: { fontSize: 18, fontWeight: '500', flex: 1, paddingRight: spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: ICON_GAP },
  iconBtn: { padding: spacing.xs, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '600' },
});
