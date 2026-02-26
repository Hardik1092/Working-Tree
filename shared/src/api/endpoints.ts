/**
 * API path constants (no base URL). Used by mobile (and optionally web) services.
 */
export const AUTH = {
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
} as const;

export const USERS = {
  ME: '/users/me',
  BY_ID: (id: string) => `/users/${id}`,
  UPDATE_ME: '/users/me',
  PROFILE_PHOTO: '/users/profile-photo',
  AVATAR: '/users/me/avatar',
  FOLLOW: (id: string) => `/users/${id}/follow`,
  FOLLOWERS: (id: string) => `/users/${id}/followers`,
  FOLLOWING: (id: string) => `/users/${id}/following`,
  POSTS: (id: string) => `/users/${id}/posts`,
  SAVED: '/users/me/saved',
  BLOCKED: '/users/blocked',
  BLOCK: (id: string) => `/users/${id}/block`,
  IS_BLOCKED: (id: string) => `/users/${id}/is-blocked`,
  PREFERENCES_LANGUAGE: '/users/me/preferences/language',
  PREFERENCES_THEME: '/users/me/preferences/theme',
} as const;

export const POSTS = {
  CREATE: '/posts',
  RECENT: '/posts/recent',
  TRENDING: '/posts/trending',
  SAVED: '/posts/saved',
  BY_ID: (id: string) => `/posts/${id}`,
  LIKE: (id: string) => `/posts/${id}/like`,
  COMMENTS: (id: string) => `/posts/${id}/comments`,
  SAVE: (id: string) => `/posts/${id}/save`,
  USER_POSTS: (userId: string) => `/posts/user/${userId}`,
} as const;

export const NOTIFICATIONS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  SETTINGS: '/notifications/settings',
  READ_ALL: '/notifications/read-all',
  READ: (id: string) => `/notifications/${id}/read`,
  DELETE: (id: string) => `/notifications/${id}`,
} as const;

export const CHAT = {
  CONVERSATIONS: '/chat/conversations',
  CONVERSATIONS_START: '/chat/conversations/start',
  CONVERSATIONS_START_EXPERT: '/chat/conversations/start-expert',
  MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
  UPLOAD: '/chat/upload',
} as const;

export const MARKET = {
  PRICES: '/market/prices',
  COMMODITIES: '/market/commodities',
  STATES: '/market/states',
} as const;

export const WEATHER = {
  CURRENT: '/weather/current',
} as const;

export const NETWORK = {
  RECOMMENDATIONS: '/network/recommendations',
} as const;

export const SETTINGS = {
  PRIVACY: '/settings/privacy',
} as const;
