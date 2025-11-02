import type { User } from '~~/shared/types/user';

export const useUserProfile = (username: string) => {
  const {
    data: userProfile,
    error,
    pending,
  } = useFetch<User>(`/api/users/${username}/profile`, {
    key: `user-profile-${username}`,
  });
  return {
    userProfile,
    error,
    loading: pending,
  };
};
