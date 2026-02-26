"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS = exports.NETWORK = exports.WEATHER = exports.MARKET = exports.CHAT = exports.NOTIFICATIONS = exports.POSTS = exports.USERS = exports.AUTH = void 0;
/**
 * API path constants (no base URL). Used by mobile (and optionally web) services.
 */
exports.AUTH = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND_OTP: '/auth/resend-otp',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_REGISTRATION_OTP: '/auth/verify-registration-otp',
    VERIFY_PASSWORD: '/auth/verify-password',
    SEND_2FA_OTP: '/auth/send-2fa-otp',
    ENABLE_2FA: '/auth/enable-2fa',
    VERIFY_LOGIN_OTP: '/auth/verify-login-otp',
    RESEND_LOGIN_OTP: '/auth/resend-login-otp',
};
exports.USERS = {
    ME: '/users/me',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_ME: '/users/me',
    PROFILE_PHOTO: '/users/profile-photo',
    AVATAR: '/users/me/avatar',
    FOLLOW: (id) => `/users/${id}/follow`,
    FOLLOWERS: (id) => `/users/${id}/followers`,
    FOLLOWING: (id) => `/users/${id}/following`,
    POSTS: (id) => `/users/${id}/posts`,
    SAVED: '/users/me/saved',
    BLOCKED: '/users/blocked',
    BLOCK: (id) => `/users/${id}/block`,
    IS_BLOCKED: (id) => `/users/${id}/is-blocked`,
    PREFERENCES_LANGUAGE: '/users/me/preferences/language',
    PREFERENCES_THEME: '/users/me/preferences/theme',
};
exports.POSTS = {
    CREATE: '/posts',
    RECENT: '/posts/recent',
    TRENDING: '/posts/trending',
    SAVED: '/posts/saved',
    BY_ID: (id) => `/posts/${id}`,
    LIKE: (id) => `/posts/${id}/like`,
    COMMENTS: (id) => `/posts/${id}/comments`,
    SAVE: (id) => `/posts/${id}/save`,
    USER_POSTS: (userId) => `/posts/user/${userId}`,
};
exports.NOTIFICATIONS = {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    SETTINGS: '/notifications/settings',
    READ_ALL: '/notifications/read-all',
    READ: (id) => `/notifications/${id}/read`,
    DELETE: (id) => `/notifications/${id}`,
};
exports.CHAT = {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATIONS_START: '/chat/conversations/start',
    CONVERSATIONS_START_EXPERT: '/chat/conversations/start-expert',
    MESSAGES: (conversationId) => `/chat/conversations/${conversationId}/messages`,
    UPLOAD: '/chat/upload',
};
exports.MARKET = {
    PRICES: '/market/prices',
    COMMODITIES: '/market/commodities',
    STATES: '/market/states',
};
exports.WEATHER = {
    CURRENT: '/weather/current',
};
exports.NETWORK = {
    RECOMMENDATIONS: '/network/recommendations',
};
exports.SETTINGS = {
    PRIVACY: '/settings/privacy',
};
