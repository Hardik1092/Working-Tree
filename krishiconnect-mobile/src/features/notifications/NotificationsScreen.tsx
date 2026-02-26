import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { NotificationItem } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { notificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const theme = colors.light;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [notifRes, count] = await Promise.all([
        notificationService.getNotifications({ limit: 30 }),
        notificationService.getUnreadCount(),
      ]);
      setList(notifRes.notifications);
      setUnreadCount(count);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    } catch (_) {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      await load(true);
    } catch (_) {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      await load(true);
    } catch (_) {}
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: item.read ? theme.background : theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
          {item.title ?? item.type ?? 'Notification'}
        </Text>
        {item.body ? (
          <Text style={[styles.body, { color: theme.muted }]} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text style={[styles.time, { color: theme.muted }]}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.read && (
        <Button title="Mark read" variant="ghost" onPress={() => handleMarkRead(item._id)} style={styles.markBtn} />
      )}
    </View>
  );

  if (loading && list.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {list.length > 0 && unreadCount > 0 ? (
        <View style={styles.header}>
          <Button title="Mark all as read" variant="outline" onPress={handleMarkAllRead} style={styles.markAllBtn} />
        </View>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md, borderBottomWidth: 1, borderColor: '#e5e5e5' },
  markAllBtn: {},
  listContent: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1 },
  rowContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12, marginTop: 2 },
  markBtn: { marginLeft: spacing.sm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});
