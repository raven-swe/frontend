<script lang="ts" setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { profileInteractionService } from '~/services/profile/profileInteractionService';

const props = defineProps<{
  username: string;
  following: boolean;
  follower: boolean;
}>();

const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: (action: 'follow' | 'unfollow') => {
    return action === 'follow'
      ? profileInteractionService.followUser(props.username)
      : profileInteractionService.unfollowUser(props.username);
  },

  onMutate: async (action) => {
    const queryKey = ['profile', props.username];

    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Get previous data
    const previousData = queryClient.getQueryData<ApiSuccessResponse<User>>(queryKey);

    if (previousData?.data) {
      const updatedUser = { ...previousData.data };

      // Optimistic update
      if (action === 'follow') {
        updatedUser.relationship.following = true;
        updatedUser.followersCount += 1;
      } else {
        updatedUser.relationship.following = false;
        updatedUser.followersCount -= 1;
      }

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
      queryClient.setQueryData(['profile', props.username], ctx.previousData);
    }
  },

  // Invalidate queries on success
  // To sync up with the backend
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['profile', props.username],
    });
  },
});
</script>

<template>
  <UiButton v-if="!props.following" @click="mutate('follow')">
    {{ props.follower ? $t('ui.follow-back') : $t('ui.follow') }}
  </UiButton>

  <UiButton v-else-if="props.following" variant="outline" @click="mutate('unfollow')">
    {{ $t('ui.unfollow') }}
  </UiButton>
</template>
