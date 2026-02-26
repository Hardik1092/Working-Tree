import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { FeedPost } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { Avatar } from './Avatar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

const CAPTION_LINES = 3;
const IMAGE_RADIUS = 14;
const CARD_MARGIN_BOTTOM = 20;
const CARD_RADIUS = 12;
const ICON_COUNT_GAP = 8;

interface PostCardProps {
  post: FeedPost;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
  showSaveAction?: boolean;
}

export function PostCard({ post, onLike, onComment, onSave, showSaveAction }: PostCardProps) {
  const theme = colors.light;
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const avatarUri =
    typeof post.author.avatar === 'string'
      ? post.author.avatar
      : (post.author as { avatar?: { url?: string } }).avatar?.url;
  const hasLongCaption = (post.content?.length ?? 0) > 80;
  const showReadMore = hasLongCaption && !captionExpanded;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* User row */}
      <View style={styles.userRow}>
        <Avatar uri={avatarUri} name={post.author.name} size={40} />
        <View style={styles.userMeta}>
          <Text style={[styles.authorName, { color: theme.foreground }]} numberOfLines={1}>
            {post.author.name}
          </Text>
          <Text style={[styles.time, { color: theme.muted }]}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
      </View>

      {/* Image */}
      {post.mediaUrl ? (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      ) : null}

      {/* Caption + engagement */}
      <View style={styles.body}>
        {post.content ? (
          <View style={styles.captionWrap}>
            <Text
              style={[styles.caption, { color: theme.foreground }]}
              numberOfLines={captionExpanded ? undefined : CAPTION_LINES}
              ellipsizeMode="tail"
            >
              {post.content}
            </Text>
            {showReadMore && (
              <TouchableOpacity
                onPress={() => setCaptionExpanded(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
              >
                <Text style={[styles.readMore, { color: theme.muted }]}>Read more</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity onPress={onLike} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? theme.primary : theme.muted}
            />
            <Text style={[styles.actionCount, { color: theme.muted }]}>{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onComment} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.muted} />
            <Text style={[styles.actionCount, { color: theme.muted }]}>{post.commentsCount}</Text>
          </TouchableOpacity>
          {showSaveAction && onSave ? (
            <TouchableOpacity onPress={onSave} style={styles.actionBtn} activeOpacity={0.7}>
              <Ionicons
                name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={theme.muted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userMeta: { marginLeft: spacing.sm, flex: 1 },
  authorName: { fontSize: 16, fontWeight: '600' },
  time: { fontSize: 12 },
  media: {
    width: '100%',
    height: 280,
    backgroundColor: colors.light.border,
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
  },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.sm },
  captionWrap: { marginBottom: spacing.sm },
  caption: { fontSize: 14, lineHeight: 22 },
  readMore: { fontSize: 14, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: ICON_COUNT_GAP },
  actionCount: { fontSize: 14 },
});
