import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_FEED_PAGE_SIZE } from '@krishiconnect/shared';
import type { FeedPost } from '@krishiconnect/shared';
import { postService } from '@/services/postService';

const FEED_QUERY_KEY = ['feed', 'recent'];

export function useFeed() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: async ({ pageParam = 1 }) => {
      const { posts } = await postService.getRecent(pageParam, DEFAULT_FEED_PAGE_SIZE);
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
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
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
