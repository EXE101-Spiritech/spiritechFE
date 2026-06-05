import axiosClient from '@/shared/api/axiosClient';
import type { UserProfile, UserProfileUpdate } from '@/shared/types';

export const userApi = {
  /** Get current user profile */
  getProfile: () =>
    axiosClient.get<UserProfile>('/v1/me').then((r) => r.data),

  /** Partial update current user profile */
  updateProfile: (data: UserProfileUpdate) =>
    axiosClient.put<UserProfile>('/v1/me', data).then((r) => r.data),
};
