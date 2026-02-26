import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { FeedPost } from '@krishiconnect/shared';
import { PostCard } from '@/components/common/PostCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useSavedPosts } from './useSavedPosts';

export function SavedPostsScreen() {
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
    toggleSave,
  } = useSavedPosts();

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onLike={() => likePost(item._id)}
      onComment={() => router.push(`/post/${item._id}`)}
      onSave={() => toggleSave(item._id)}
      showSaveAction
    />
  );

  const keyExtractor = (item: FeedPost) => item._id;

  if (isLoading) return <Spinner />;
  if (!data.length) return <EmptyState message="No saved posts." />;

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
