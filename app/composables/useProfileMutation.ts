import { useMutation, useQueryClient } from '@tanstack/vue-query';

export function useProfileMutation<T>({
  mutationFn,
  username,
  optimisticUpdateFn,
}: {
  mutationFn: (action: T) => Promise<unknown>;
  username?: string;
  optimisticUpdateFn: (data: User, action: T) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (action: T) => {
      const queryKey = ['profile', username];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Get previous data
      const previousData = queryClient.getQueryData<ApiSuccessResponse<User>>(queryKey);

      if (previousData?.data) {
        const updatedUser = { ...previousData.data };

        optimisticUpdateFn(updatedUser, action);

        queryClient.setQueryData(queryKey, {
          ...previousData,
          data: updatedUser,
        });
      }

      return { previousData };
    },

    // Rollback on error
    onError: (_err, _action, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['profile', username], ctx.previousData);
      }
    },

    // Invalidate queries on success
    // To sync up with the backend
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', username],
      });
    },
  });
}
