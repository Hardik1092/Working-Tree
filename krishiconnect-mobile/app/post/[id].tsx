import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Comment, PostAuthor } from '@krishiconnect/shared';
import { formatRelativeTime } from '@krishiconnect/shared';
import { postService } from '@/services/postService';
import { PostCard } from '@/components/common/PostCard';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useQueryClient } from '@tanstack/react-query';

const FEED_QUERY_KEY = ['feed', 'recent'];

function CommentItem({ comment }: { comment: Comment }) {
  const theme = colors.light;
  const author = typeof comment.author === 'object' ? (comment.author as PostAuthor) : { _id: comment.author, name: 'User' };
  const avatarUri = typeof author.avatar === 'string' ? author.avatar : (author as { avatar?: { url?: string } }).avatar?.url;
  const text = comment.content ?? comment.text ?? '';

  return (
    <View style={[styles.commentRow, { borderColor: theme.border }]}>
      <Avatar uri={avatarUri} name={author.name} size={32} />
      <View style={styles.commentBody}>
        <Text style={[styles.commentAuthor, { color: theme.foreground }]}>{author.name}</Text>
        <Text style={[styles.commentText, { color: theme.foreground }]}>{text}</Text>
        <Text style={[styles.commentTime, { color: theme.muted }]}>{formatRelativeTime(comment.createdAt)}</Text>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [post, setPost] = useState<Awaited<ReturnType<typeof postService.getPostById>>>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = colors.light;

  const load = async (refresh = false) => {
    if (!id) return;
    const p = refresh ? 1 : page;
    if (refresh) setRefreshing(true);
    else if (p === 1) setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        postService.getPostById(id),
        postService.getComments(id, p, 15),
      ]);
      setPost(postRes);
      if (refresh || p === 1) setComments(commentsRes.comments ?? []);
      else setComments((prev) => [...prev, ...(commentsRes.comments ?? [])]);
      setHasMore((commentsRes.comments ?? []).length >= 15);
      setPage(p + 1);
    } catch (_) {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    load(true);
  }, [id]);

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || !id || submitting) return;
    setSubmitting(true);
    try {
      await postService.addComment(id, text);
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      await load(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!id) return;
    try {
      await postService.toggleLike(id);
      const updated = await postService.getPostById(id);
      setPost(updated);
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    } catch (_) {}
  };

  if (!id) return null;
  if (loading && !post) return <Spinner />;
  if (!post) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Post not found</Text>
        <Button title="Back" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListHeaderComponent={
          <>
            <PostCard
              post={post}
              onLike={handleLike}
              onComment={() => {}}
            />
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Comments {post.commentsCount > 0 ? `(${post.commentsCount})` : ''}
            </Text>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        onEndReached={() => { if (hasMore && !refreshing) load(false); }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
      />
      <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <TextInput
          placeholder="Add a comment…"
          placeholderTextColor={theme.muted}
          value={commentText}
          onChangeText={setCommentText}
          style={[styles.input, { color: theme.foreground }]}
          editable={!submitting}
        />
        <Button
          title={submitting ? '…' : 'Post'}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submitting}
          style={styles.postBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  listContent: { paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginHorizontal: spacing.md, marginBottom: spacing.sm },
  commentRow: { flexDirection: 'row', padding: spacing.md, borderBottomWidth: 1 },
  commentBody: { marginLeft: spacing.sm, flex: 1 },
  commentAuthor: { fontWeight: '600', fontSize: 14 },
  commentText: { fontSize: 14, marginTop: 2 },
  commentTime: { fontSize: 12, marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 16 },
  postBtn: { marginLeft: spacing.sm },
});
