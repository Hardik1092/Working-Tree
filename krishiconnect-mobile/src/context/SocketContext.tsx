import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { env } from '@/config/env';
import { userService } from '@/services/userService';

type AnyHandler = (...args: any[]) => void;

type SocketContextValue = {
  connected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, type: string, content: unknown, replyToId?: string | null) => void;
  emitMessageSeen: (conversationId: string) => void;
  emitMessageDelivered: (messageId: string) => void;
  emitReaction: (messageId: string, emoji: string) => void;
  emitEditMessage: (messageId: string, text: string) => void;
  emitUnsendMessage: (messageId: string) => void;
  emitTypingStart: (conversationId: string) => void;
  emitTypingStop: (conversationId: string) => void;
  subscribe: (event: string, handler: AnyHandler) => () => void;
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextValue | null>(null);

function getSocketOriginFromApiBase(apiBaseUrl: string) {
  try {
    const u = new URL(apiBaseUrl);
    return u.origin;
  } catch {
    const cleaned = apiBaseUrl.replace(/\/$/, '');
    const idx = cleaned.indexOf('/api/');
    if (idx > -1) return cleaned.slice(0, idx);
    return cleaned;
  }
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = accessToken ?? null;

    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      tokenRef.current = null;
      setConnected(false);
      return;
    }

    if (socketRef.current && tokenRef.current === token) return;

    tokenRef.current = token;
    const url = getSocketOriginFromApiBase(env.API_BASE_URL);

    const socket = io(url, {
      auth: { token },
      transports: ['polling', 'websocket'],
      autoConnect: false,
      reconnectionAttempts: 2,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    socketRef.current = socket;
    setConnected(false);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => {
      setConnected(false);
      socket.disconnect();
    });
    socket.on('role-upgraded', async () => {
      try {
        const updated = await userService.getMe();
        await setUser(updated);
      } catch {
        // ignore
      }
    });

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('role-upgraded');
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      tokenRef.current = null;
      setConnected(false);
    };
  }, [accessToken, setUser]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('conversation:join', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current || !conversationId) return;
    const s = socketRef.current as any;
    if (typeof s.leave === 'function') {
      s.leave(conversationId);
    } else {
      socketRef.current.emit('conversation:leave', { conversationId });
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, type: string, content: unknown, replyToId: string | null = null) => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('message:send', {
          conversationId,
          type: type || 'text',
          content:
            type === 'text'
              ? typeof content === 'string'
                ? { text: content }
                : content
              : content,
          ...(replyToId ? { replyToId } : {}),
        });
      }
    },
    []
  );

  const emitMessageSeen = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('message:seen', conversationId);
    }
  }, []);

  const emitMessageDelivered = useCallback((messageId: string) => {
    if (socketRef.current && messageId) {
      socketRef.current.emit('message:delivered', { messageId });
    }
  }, []);

  const emitReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current && messageId && emoji) {
      socketRef.current.emit('message:reaction', { messageId, emoji });
    }
  }, []);

  const emitEditMessage = useCallback((messageId: string, text: string) => {
    if (socketRef.current && messageId && text != null) {
      socketRef.current.emit('message:edit', { messageId, text });
    }
  }, []);

  const emitUnsendMessage = useCallback((messageId: string) => {
    if (socketRef.current && messageId) {
      socketRef.current.emit('message:unsend', { messageId });
    }
  }, []);

  const emitTypingStart = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing:start', { conversationId });
    }
  }, []);

  const emitTypingStop = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing:stop', { conversationId });
    }
  }, []);

  const subscribe = useCallback((event: string, handler: AnyHandler) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      connected,
      joinConversation,
      leaveConversation,
      sendMessage,
      emitMessageSeen,
      emitMessageDelivered,
      emitReaction,
      emitEditMessage,
      emitUnsendMessage,
      emitTypingStart,
      emitTypingStop,
      subscribe,
      socket: socketRef.current,
    }),
    [
      connected,
      emitEditMessage,
      emitMessageDelivered,
      emitMessageSeen,
      emitReaction,
      emitTypingStart,
      emitTypingStop,
      emitUnsendMessage,
      joinConversation,
      leaveConversation,
      sendMessage,
      subscribe,
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

