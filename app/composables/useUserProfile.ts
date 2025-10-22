export const useUserProfile = (username: string) => {
  const {
    data: userProfile,
    error,
    pending,
  } = useFetch<User>(`/api/profile/${username}`, {
    key: `user-profile-${username}`,
  });
  return {
    userProfile,
    error,
    loading: pending,
  };
};
