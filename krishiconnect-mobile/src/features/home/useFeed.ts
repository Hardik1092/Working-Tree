import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_FEED_PAGE_SIZE } from '@krishiconnect/shared';
import type { FeedPost } from '@krishiconnect/shared';
import { postService } from '@/services/postService';

export type FeedMode = 'recent' | 'trending';

export function useFeed(mode: FeedMode) {
  const queryClient = useQueryClient();
  const queryKey = ['feed', mode] as const;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const { posts } =
        mode === 'trending'
          ? await postService.getTrending(pageParam, DEFAULT_FEED_PAGE_SIZE)
          : await postService.getRecent(pageParam, DEFAULT_FEED_PAGE_SIZE);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < DEFAULT_FEED_PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'trending'] });
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
    likePost: likeMutation.mutateAsync,
  };
}
