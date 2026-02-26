import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_FEED_PAGE_SIZE } from '@krishiconnect/shared';
import type { FeedPost } from '@krishiconnect/shared';
import { postService } from '@/services/postService';

const SAVED_QUERY_KEY = ['posts', 'saved'];

export function useSavedPosts() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: SAVED_QUERY_KEY,
    queryFn: async ({ pageParam = 1 }) => {
      const { posts } = await postService.getSaved(pageParam, DEFAULT_FEED_PAGE_SIZE);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < DEFAULT_FEED_PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleSave(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
    },
  });

  const flattenData: FeedPost[] = query.data?.pages?.flat() ?? [];

  return {
    data: flattenData,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    toggleSave: toggleSaveMutation.mutateAsync,
    likePost: async (postId: string) => {
      await postService.toggleLike(postId);
      queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
    },
  };
}
