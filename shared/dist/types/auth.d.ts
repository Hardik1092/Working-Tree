/**
 * Backend API response envelope.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
    timestamp?: string;
}
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginPayload {
    password: string;
    phoneNumber?: string;
    email?: string;
}
export interface LoginResponseSuccess {
    user: User;
    tokens: Tokens;
}
export interface LoginResponse2FA {
    requires2FA: true;
    userId: string;
}
export type LoginResponse = LoginResponseSuccess | LoginResponse2FA;
export interface RegisterPayload {
    name: string;
    password: string;
    phoneNumber?: string;
    email?: string;
    location?: {
        state?: string;
        district?: string;
        village?: string;
    };
}
export interface User {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    username?: string;
    avatar?: {
        url?: string;
        publicId?: string;
    } | string;
    profilePhoto?: {
        url?: string;
        publicId?: string;
    } | string;
    bio?: string;
    role?: 'admin' | 'farmer' | 'expert';
    isExpert?: boolean;
    preferences?: UserPreferences;
    location?: {
        city?: string;
        state?: string;
        district?: string;
        village?: string;
        country?: string;
    };
    stats?: {
        followersCount?: number;
        followingCount?: number;
        postsCount?: number;
        likesCount?: number;
    };
    [key: string]: unknown;
}
export interface UserPreferences {
    language?: string;
    darkMode?: boolean;
    notifications?: boolean;
}
//# sourceMappingURL=auth.d.ts.map