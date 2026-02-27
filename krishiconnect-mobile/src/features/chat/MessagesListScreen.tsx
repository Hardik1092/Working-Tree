import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import type { Conversation } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/common/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';

export function MessagesListScreen() {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?._id ?? null);
  const [list, setList] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await chatService.getConversations({ limit: 50 });
      setList(res.conversations ?? []);
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

  const theme = colors.light;

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = item.participants?.find((p: any) => {
      const u = p?.user ?? p;
      const id = typeof u === 'object' && u ? (u._id ?? u.id) : u;
      return currentUserId ? String(id) !== String(currentUserId) : true;
    });
    const user = (other?.user ?? other ?? item.participants?.[0]?.user ?? item.participants?.[0]) as
      | { _id?: string; name?: string; profilePhoto?: { url?: string }; avatar?: string }
      | undefined;
    const name = user?.name ?? 'Unknown';
    const avatarUri = user?.profilePhoto?.url ?? (user as { avatar?: string })?.avatar;
    const lastMsg = item.lastMessage as any | undefined;
    const rawPreview = lastMsg?.text ?? lastMsg?.content ?? '';
    const preview =
      typeof rawPreview === 'string'
        ? rawPreview
        : rawPreview && typeof rawPreview === 'object' && rawPreview.text != null
          ? String(rawPreview.text)
          : 'No messages yet';
    const time = lastMsg?.createdAt ?? lastMsg?.sentAt ?? item.updatedAt;

    return (
      <TouchableOpacity
        style={[styles.row, { borderColor: theme.border }]}
        onPress={() => router.push(`/(drawer)/(tabs)/messages/${item._id}`)}
        activeOpacity={0.7}
      >
        <Avatar uri={avatarUri} name={name} size={48} />
        <View style={styles.rowContent}>
          <Text style={[styles.name, { color: theme.foreground }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.preview, { color: theme.muted }]} numberOfLines={1}>{preview}</Text>
        </View>
        {time ? (
          <Text style={[styles.time, { color: theme.muted }]}>{formatRelativeTime(time)}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading && list.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1 },
  rowContent: { flex: 1, marginLeft: spacing.sm },
  name: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});
