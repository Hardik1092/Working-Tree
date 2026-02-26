import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_FEED_PAGE_SIZE } from '@krishiconnect/shared';
import type { FeedPost } from '@krishiconnect/shared';
import { postService } from '@/services/postService';

export function profilePostsQueryKey(userId: string) {
  return ['profile', 'posts', userId] as const;
}

export function useProfilePosts(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: profilePostsQueryKey(userId ?? ''),
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) return [];
      const { posts } = await postService.getPostsByUser(userId, pageParam, DEFAULT_FEED_PAGE_SIZE);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < DEFAULT_FEED_PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!userId,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onSuccess: (_, __, context) => {
      if (userId) queryClient.invalidateQueries({ queryKey: profilePostsQueryKey(userId) });
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
