import React from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import type { FeedPost } from '@krishiconnect/shared';
import { PostCard } from '@/components/common/PostCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useProfilePosts } from './useProfilePosts';
import { useAuthStore } from '@/store/authStore';

export function MyPostsScreen() {
  const userId = useAuthStore((s) => s.user?._id);
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    likePost,
  } = useProfilePosts(userId ?? undefined);

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard post={item} onLike={() => likePost(item._id)} onComment={() => {}} />
  );

  const keyExtractor = (item: FeedPost) => item._id;

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (data.length === 0) {
    return <EmptyState message="You haven't posted yet." />;
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.3}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 24 },
});
