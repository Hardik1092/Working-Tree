import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { FeedPost } from '@krishiconnect/shared';
import { PostCard } from '@/components/common/PostCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useFeed } from './useFeed';
import { spacing } from '@/theme/spacing';

export function FeedList() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    likePost,
  } = useFeed();

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onLike={() => likePost(item._id)}
      onComment={() => router.push(`/post/${item._id}`)}
    />
  );

  const keyExtractor = (item: FeedPost) => item._id;

  if (isLoading) {
    return <Spinner />;
  }

  if (!data.length) {
    return <EmptyState message="No posts yet. Be the first to post!" />;
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
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={6}
      initialNumToRender={6}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.md,
    paddingBottom: 88,
  },
});
