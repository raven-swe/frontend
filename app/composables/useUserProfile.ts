import type { UserProfile } from '~~/shared/types/user';

export const useUserProfile = (username: string) => {
  const {
    data: userProfile,
    error,
    pending,
  } = useFetch<UserProfile>(`/api/users/${username}/profile`, {
    key: `user-profile-${username}`,
  });
  return {
    userProfile,
    error,
    loading: pending,
  };
};
