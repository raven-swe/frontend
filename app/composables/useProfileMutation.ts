import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';

export function useProfileMutation<T, Q = void>({
  mutationFn,
  username,
  optimisticUpdateFn,
}: {
  mutationFn: (action: T) => Promise<Q>;
  username: string;
  optimisticUpdateFn: (data: User, action: T) => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const loweredUsername = username.toLowerCase();

  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    T,
    {
      previousData?: User;
    }
  >({
    mutationFn,
    onMutate: async (action: T) => {
      const queryKey = ['profile', loweredUsername];
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Get previous data
      const previousData = queryClient.getQueryData<User>(queryKey);
      if (previousData) {
        const updatedUser = { ...previousData };

        optimisticUpdateFn(updatedUser, action);
        queryClient.setQueryData(queryKey, updatedUser);
      }

      return { previousData };
    },

    // Rollback on error
    onError: (_err, _action, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['profile', loweredUsername], ctx.previousData);
      }
      showToaster('error', t(`errors.${_err?.data?.data?.error.code || 'UNKNOWN_ERROR'}`));
    },

    // Invalidate queries on finishing request
    // To sync up with the backend
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', loweredUsername],
      });
    },
  });
}
