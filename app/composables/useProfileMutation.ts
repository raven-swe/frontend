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

  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    T,
    {
      previousData?: ApiSuccessResponse<User>;
    }
  >({
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
      showToaster('error', t(`errors.${_err?.data?.data?.error.code || 'UNKNOWN_ERROR'}`));
    },

    // Invalidate queries on finishing request
    // To sync up with the backend
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', username],
      });
    },
  });
}
