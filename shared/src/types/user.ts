import type { User } from './auth';

export type UserProfile = User;

export interface UserPreferences {
  language?: string;
  darkMode?: boolean;
  notifications?: boolean;
}
