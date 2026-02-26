export interface PostAuthor {
    _id: string;
    name: string;
    avatar?: string;
    headline?: string;
    verified?: boolean;
}
export interface PostMediaItem {
    url: string;
    publicId: string;
    type: 'image' | 'video';
}
export interface Post {
    _id: string;
    content: string;
    media?: PostMediaItem[];
    tags?: string[];
    author: PostAuthor | string;
    likesCount: number;
    commentsCount: number;
    savedCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
    createdAt: string;
    updatedAt?: string;
}
export interface Comment {
    _id: string;
    post: string;
    author: PostAuthor | string;
    text?: string;
    content?: string;
    likesCount?: number;
    createdAt: string;
    updatedAt?: string;
}
/** Feed card shape (normalized for list display) */
export interface FeedPost {
    _id: string;
    content: string;
    media: PostMediaItem[];
    mediaUrl?: string | null;
    tags: string[];
    likesCount: number;
    commentsCount: number;
    savedCount: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
    author: PostAuthor;
}
//# sourceMappingURL=post.d.ts.map