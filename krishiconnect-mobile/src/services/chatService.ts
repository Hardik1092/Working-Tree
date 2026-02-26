import { CHAT } from '@krishiconnect/shared';
import type { Conversation, ChatMessage } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const chatService = {
  async getConversations(params: { page?: number; limit?: number } = {}): Promise<{
    conversations: Conversation[];
    pagination?: { nextCursor?: string };
  }> {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.limit != null) q.set('limit', String(params.limit));
    const query = q.toString();
    const { data } = await request<{ data: Conversation[]; meta?: { pagination?: { nextCursor?: string } } }>(
      'GET',
      query ? `${CHAT.CONVERSATIONS}?${query}` : CHAT.CONVERSATIONS
    );
    const inner = (data as { data?: Conversation[] }).data ?? data;
    const conversations = Array.isArray(inner) ? inner : [];
    const meta = (data as { meta?: { pagination?: { nextCursor?: string } } }).meta;
    return { conversations, pagination: meta?.pagination };
  },

  async getMessages(
    conversationId: string,
    params: { page?: number; limit?: number; before?: string } = {}
  ): Promise<{ messages: ChatMessage[]; pagination?: { nextCursor?: string } }> {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.limit != null) q.set('limit', String(params.limit));
    if (params.before) q.set('before', params.before);
    const query = q.toString();
    const { data } = await request<{ data: ChatMessage[]; meta?: { pagination?: { nextCursor?: string } } }>(
      'GET',
      query ? `${CHAT.MESSAGES(conversationId)}?${query}` : CHAT.MESSAGES(conversationId)
    );
    const inner = (data as { data?: ChatMessage[] }).data ?? data;
    const messages = Array.isArray(inner) ? inner : [];
    const meta = (data as { meta?: { pagination?: { nextCursor?: string } } }).meta;
    return { messages, pagination: meta?.pagination };
  },

  async startConversation(otherUserId: string): Promise<Conversation> {
    const { data } = await request<ApiEnvelope<Conversation>>('POST', CHAT.CONVERSATIONS_START, {
      otherUserId,
    });
    return (data.data ?? data) as Conversation;
  },
};
