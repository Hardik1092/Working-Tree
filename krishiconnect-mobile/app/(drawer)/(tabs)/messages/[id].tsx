import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import type { ChatMessage } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/common/Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/context/SocketContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const theme = colors.light;
  const sender = typeof message.sender === 'object' ? message.sender : null;
  const name = sender && typeof sender === 'object' && 'name' in sender ? (sender as { name?: string }).name : 'User';
  const rawContent = (message as unknown as { content?: unknown; text?: unknown }).content ?? (message as unknown as { text?: unknown }).text ?? '';
  const text =
    typeof rawContent === 'string'
      ? rawContent
      : (rawContent as { text?: unknown } | null)?.text != null
        ? String((rawContent as { text?: unknown }).text)
        : '';
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
  const insets = useSafeAreaInsets();
  const {
    connected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    emitMessageDelivered,
    emitTypingStart,
    emitTypingStop,
    subscribe,
  } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const theme = colors.light;
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (id) joinConversation(id);

      const unsubNew = subscribe('message:new', (payload: any) => {
        const convId = payload?.conversation ?? payload?.conversationId;
        if (!convId || String(convId) !== String(id)) return;
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(payload?._id))) return prev;
          const senderId = payload?.sender?._id ?? payload?.sender ?? payload?.senderId;
          const fromMe = currentUserId != null && String(senderId) === String(currentUserId);
          if (!fromMe && payload?._id) emitMessageDelivered?.(String(payload._id));
          if (fromMe) {
            const withoutTemp = prev.filter((m) => !String(m._id).startsWith('temp-'));
            return [...withoutTemp, payload];
          }
          return [...prev, payload];
        });
      });

      return () => {
        unsubNew();
        if (id) leaveConversation(id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      };
    }, [load])
  );

  if (!id) return null;

  const canSend = input.trim().length > 0 && connected;

  const handleTyping = useCallback(() => {
    if (!id) return;
    emitTypingStart(id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(id);
      typingTimeoutRef.current = null;
    }, 1500);
  }, [emitTypingStart, emitTypingStop, id]);

  const handleSend = useCallback(() => {
    if (!id) return;
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);

    const optimistic: ChatMessage = {
      _id: `temp-${Date.now()}`,
      conversation: id,
      sender: currentUserId ?? 'me',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    socketSendMessage(id, 'text', text, null);
    setSending(false);
  }, [currentUserId, id, input, sending, socketSendMessage]);

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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 72 + insets.bottom }]}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No messages yet</Text>
          </View>
        }
      />
      <View style={[styles.composer, { borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            value={input}
            onChangeText={(t) => {
              setInput(t);
              handleTyping();
            }}
            placeholder={connected ? 'Message…' : 'Connecting…'}
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.foreground }]}
            editable={connected}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!canSend || sending}
            style={[styles.sendBtn, { backgroundColor: canSend ? theme.primary : theme.border }]}
          >
            <Ionicons name="send" size={18} color={canSend ? theme.primaryForeground : theme.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: spacing.md },
  centered: { padding: spacing.xl, alignItems: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.sm },
  bubbleRowOwn: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', padding: spacing.sm, borderRadius: 12, marginHorizontal: spacing.sm },
  senderName: { fontSize: 12, marginBottom: 2 },
  bubbleText: { fontSize: 15 },
  bubbleTime: { fontSize: 11, marginTop: 2 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingTop: spacing.sm, backgroundColor: '#fafafa' },
  inputWrap: { borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'flex-end', paddingLeft: spacing.sm, paddingRight: spacing.sm, paddingVertical: spacing.xs },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingTop: spacing.sm, paddingBottom: spacing.sm, paddingRight: spacing.sm },
  sendBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
