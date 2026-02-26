/**
 * API path constants (no base URL). Used by mobile (and optionally web) services.
 */
export declare const AUTH: {
    readonly LOGIN: "/auth/login";
    readonly REGISTER: "/auth/register";
    readonly LOGOUT: "/auth/logout";
    readonly REFRESH_TOKEN: "/auth/refresh-token";
    readonly FORGOT_PASSWORD: "/auth/forgot-password";
    readonly RESET_PASSWORD: "/auth/reset-password";
    readonly RESEND_OTP: "/auth/resend-otp";
    readonly VERIFY_OTP: "/auth/verify-otp";
    readonly VERIFY_REGISTRATION_OTP: "/auth/verify-registration-otp";
    readonly VERIFY_PASSWORD: "/auth/verify-password";
    readonly SEND_2FA_OTP: "/auth/send-2fa-otp";
    readonly ENABLE_2FA: "/auth/enable-2fa";
    readonly VERIFY_LOGIN_OTP: "/auth/verify-login-otp";
    readonly RESEND_LOGIN_OTP: "/auth/resend-login-otp";
};
export declare const USERS: {
    readonly ME: "/users/me";
    readonly BY_ID: (id: string) => string;
    readonly UPDATE_ME: "/users/me";
    readonly PROFILE_PHOTO: "/users/profile-photo";
    readonly AVATAR: "/users/me/avatar";
    readonly FOLLOW: (id: string) => string;
    readonly FOLLOWERS: (id: string) => string;
    readonly FOLLOWING: (id: string) => string;
    readonly POSTS: (id: string) => string;
    readonly SAVED: "/users/me/saved";
    readonly BLOCKED: "/users/blocked";
    readonly BLOCK: (id: string) => string;
    readonly IS_BLOCKED: (id: string) => string;
    readonly PREFERENCES_LANGUAGE: "/users/me/preferences/language";
    readonly PREFERENCES_THEME: "/users/me/preferences/theme";
};
export declare const POSTS: {
    readonly CREATE: "/posts";
    readonly RECENT: "/posts/recent";
    readonly TRENDING: "/posts/trending";
    readonly SAVED: "/posts/saved";
    readonly BY_ID: (id: string) => string;
    readonly LIKE: (id: string) => string;
    readonly COMMENTS: (id: string) => string;
    readonly SAVE: (id: string) => string;
    readonly USER_POSTS: (userId: string) => string;
};
export declare const NOTIFICATIONS: {
    readonly LIST: "/notifications";
    readonly UNREAD_COUNT: "/notifications/unread-count";
    readonly SETTINGS: "/notifications/settings";
    readonly READ_ALL: "/notifications/read-all";
    readonly READ: (id: string) => string;
    readonly DELETE: (id: string) => string;
};
export declare const CHAT: {
    readonly CONVERSATIONS: "/chat/conversations";
    readonly CONVERSATIONS_START: "/chat/conversations/start";
    readonly CONVERSATIONS_START_EXPERT: "/chat/conversations/start-expert";
    readonly MESSAGES: (conversationId: string) => string;
    readonly UPLOAD: "/chat/upload";
};
export declare const MARKET: {
    readonly PRICES: "/market/prices";
    readonly COMMODITIES: "/market/commodities";
    readonly STATES: "/market/states";
};
export declare const WEATHER: {
    readonly CURRENT: "/weather/current";
};
export declare const NETWORK: {
    readonly RECOMMENDATIONS: "/network/recommendations";
};
export declare const SETTINGS: {
    readonly PRIVACY: "/settings/privacy";
};
//# sourceMappingURL=endpoints.d.ts.map