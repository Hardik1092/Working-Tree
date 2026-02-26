import { POSTS, DEFAULT_FEED_PAGE_SIZE } from '@krishiconnect/shared';
import type { FeedPost, Post, Comment } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: { total?: number; page?: number; limit?: number };
}

function mapAuthor(author: { _id: string; name?: string; avatar?: { url?: string }; profilePhoto?: { url?: string } } | string): { _id: string; name: string; avatar?: string } {
  if (typeof author === 'string') return { _id: author, name: 'User' };
  const url = author.profilePhoto?.url ?? (author.avatar as { url?: string } | undefined)?.url ?? (author.avatar as string | undefined);
  return {
    _id: author._id,
    name: author.name ?? 'User',
    avatar: typeof url === 'string' ? url : undefined,
  };
}

function toFeedPost(p: Post & { isLiked?: boolean; isSaved?: boolean }): FeedPost {
  const author = typeof p.author === 'object' ? mapAuthor(p.author) : { _id: p.author, name: 'User' };
  const media = p.media ?? [];
  const mediaUrl = media[0]?.url ?? null;
  return {
    _id: p._id,
    content: typeof p.content === 'string' ? p.content : '',
    media,
    mediaUrl,
    tags: p.tags ?? [],
    likesCount: p.likesCount ?? 0,
    commentsCount: p.commentsCount ?? 0,
    savedCount: p.savedCount ?? 0,
    isLiked: !!p.isLiked,
    isSaved: !!p.isSaved,
    createdAt: p.createdAt,
    author,
  };
}

export const postService = {
  async getRecent(page: number, limit: number = DEFAULT_FEED_PAGE_SIZE): Promise<{ posts: FeedPost[]; meta?: ApiEnvelope<unknown>['meta'] }> {
    const { data } = await request<ApiEnvelope<(Post & { isLiked?: boolean; isSaved?: boolean })[]>>(
      'GET',
      `${POSTS.RECENT}?page=${page}&limit=${limit}`
    );
    const raw = data.data ?? data;
    const postsArray = Array.isArray(raw) ? raw : (raw as { posts?: (Post & { isLiked?: boolean; isSaved?: boolean })[] })?.posts ?? [];
    return {
      posts: postsArray.map(toFeedPost),
      meta: data.meta,
    };
  },

  async getTrending(page: number, limit: number = DEFAULT_FEED_PAGE_SIZE): Promise<{ posts: FeedPost[]; meta?: ApiEnvelope<unknown>['meta'] }> {
    const { data } = await request<ApiEnvelope<(Post & { isLiked?: boolean; isSaved?: boolean })[]>>(
      'GET',
      `${POSTS.TRENDING}?page=${page}&limit=${limit}`
    );
    const raw = data.data ?? data;
    const postsArray = Array.isArray(raw) ? raw : (raw as { posts?: (Post & { isLiked?: boolean; isSaved?: boolean })[] })?.posts ?? [];
    return {
      posts: postsArray.map(toFeedPost),
      meta: data.meta,
    };
  },

  async getPostById(id: string): Promise<FeedPost | null> {
    const { data } = await request<ApiEnvelope<Post & { isLiked?: boolean; isSaved?: boolean }>>('GET', POSTS.BY_ID(id));
    const raw = data.data ?? data;
    return raw ? toFeedPost(raw) : null;
  },

  async getPostsByUser(userId: string, page: number, limit: number = DEFAULT_FEED_PAGE_SIZE): Promise<{ posts: FeedPost[]; meta?: ApiEnvelope<unknown>['meta'] }> {
    const { data } = await request<ApiEnvelope<(Post & { isLiked?: boolean; isSaved?: boolean })[]>>(
      'GET',
      `${POSTS.USER_POSTS(userId)}?page=${page}&limit=${limit}`
    );
    const raw = data.data ?? data;
    const postsArray = Array.isArray(raw) ? raw : (raw as { posts?: (Post & { isLiked?: boolean; isSaved?: boolean })[] })?.posts ?? [];
    return {
      posts: postsArray.map(toFeedPost),
      meta: data.meta,
    };
  },

  async toggleLike(postId: string): Promise<void> {
    await request('POST', POSTS.LIKE(postId));
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    const { data } = await request<ApiEnvelope<Comment>>('POST', POSTS.COMMENTS(postId), { content });
    return (data.data ?? data) as Comment;
  },

  async getComments(postId: string, page: number, limit: number): Promise<{ comments: Comment[] }> {
    const { data } = await request<ApiEnvelope<{ comments?: Comment[] }>>(
      'GET',
      `${POSTS.COMMENTS(postId)}?page=${page}&limit=${limit}`
    );
    const comments = (data.data as { comments?: Comment[] })?.comments ?? (Array.isArray(data.data) ? data.data : []);
    return { comments };
  },

  async getSaved(page: number, limit: number = DEFAULT_FEED_PAGE_SIZE): Promise<{ posts: FeedPost[]; meta?: ApiEnvelope<unknown>['meta'] }> {
    const { data } = await request<ApiEnvelope<(Post & { isLiked?: boolean; isSaved?: boolean })[]>>(
      'GET',
      `${POSTS.SAVED}?page=${page}&limit=${limit}`
    );
    const raw = data.data ?? data;
    const postsArray = Array.isArray(raw) ? raw : (raw as { posts?: (Post & { isLiked?: boolean; isSaved?: boolean })[] })?.posts ?? [];
    return {
      posts: postsArray.map(toFeedPost),
      meta: data.meta,
    };
  },

  async toggleSave(postId: string): Promise<void> {
    await request('POST', POSTS.SAVE(postId));
  },

  async createPost(formData: FormData): Promise<FeedPost> {
    const { data } = await request<ApiEnvelope<{ post: Post & { isLiked?: boolean; isSaved?: boolean } }>>(
      'POST',
      POSTS.CREATE,
      null,
      { body: formData }
    );
    const raw = data.data ?? data;
    const post = (raw as { post?: Post & { isLiked?: boolean; isSaved?: boolean } })?.post ?? raw;
    return toFeedPost(post);
  },
};
