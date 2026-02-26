import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import type { ChatMessage } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/common/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const theme = colors.light;
  const sender = typeof message.sender === 'object' ? message.sender : null;
  const name = sender && typeof sender === 'object' && 'name' in sender ? (sender as { name?: string }).name : 'User';
  const text = message.content ?? message.text ?? '';
  const avatarUri = sender && typeof sender === 'object' && 'profilePhoto' in sender
    ? (sender as { profilePhoto?: { url?: string } }).profilePhoto?.url
    : (sender as { avatar?: string })?.avatar;

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      {!isOwn && <Avatar uri={avatarUri} name={name} size={28} />}
      <View style={[styles.bubble, isOwn ? { backgroundColor: theme.primary } : { backgroundColor: theme.card }]}>
        {!isOwn && <Text style={[styles.senderName, { color: theme.muted }]}>{name}</Text>}
        <Text style={[styles.bubbleText, { color: isOwn ? theme.primaryForeground : theme.foreground }]}>{text}</Text>
        <Text style={[styles.bubbleTime, { color: isOwn ? 'rgba(255,255,255,0.8)' : theme.muted }]}>
          {formatRelativeTime(message.createdAt)}
        </Text>
      </View>
      {isOwn && <Avatar uri={avatarUri} name={name} size={28} />}
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = colors.light;

  const load = useCallback(async (refresh = false) => {
    if (!id) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await chatService.getMessages(id, { limit: 50 });
      setMessages(res.messages ?? []);
    } catch (_) {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  if (!id) return null;

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const senderId = typeof item.sender === 'object' && item.sender && '_id' in item.sender
      ? (item.sender as { _id: string })._id
      : item.sender;
    const isOwn = senderId === currentUserId;
    return <MessageBubble message={item} isOwn={!!isOwn} />;
  };

  if (loading && messages.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No messages yet. Real-time send coming soon.</Text>
          </View>
        }
      />
      <View style={[styles.footer, { borderColor: theme.border }]}>
        <Text style={[styles.footerHint, { color: theme.muted }]}>
          Sending messages requires the web app (real-time connection). Coming soon on mobile.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 80 },
  centered: { padding: spacing.xl, alignItems: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.sm },
  bubbleRowOwn: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', padding: spacing.sm, borderRadius: 12, marginHorizontal: spacing.sm },
  senderName: { fontSize: 12, marginBottom: 2 },
  bubbleText: { fontSize: 15 },
  bubbleTime: { fontSize: 11, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, borderTopWidth: 1, backgroundColor: '#fafafa' },
  footerHint: { fontSize: 12, textAlign: 'center' },
});
