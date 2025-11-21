<script lang="ts" setup>
import { useIsCurrentUser } from '@/composables/useIsCurrentUser';
import { profileInteractionService } from '@/services/profile/profileInteractionService';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: (action: 'follow' | 'unfollow') => {
    return action === 'follow'
      ? profileInteractionService.followUser(user!.value.username)
      : profileInteractionService.unfollowUser(user!.value.username);
  },

  onMutate: async (action) => {
    const queryKey = ['profile', user?.value.username];

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
      queryClient.setQueryData(['profile', user!.value.username], ctx.previousData);
    }
  },

  // Invalidate queries on success
  // To sync up with the backend
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['profile', user?.value.username],
    });
  },
});
</script>
<template>
  <div class="mx-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <NuxtImg
        :src="user?.avatarUrl || ''"
        alt="Profile picture"
        class="z-20 -mt-16 size-34 rounded-full border-4 object-cover"
        loading="eager"
      />
    </div>
    <UiButton v-if="!isCurrentUser && !user?.relationship.following" @click="mutate('follow')">
      {{ $t('ui.follow') }}
    </UiButton>

    <UiButton
      v-else-if="!isCurrentUser && user?.relationship.following"
      variant="outline"
      @click="mutate('unfollow')"
    >
      {{ $t('ui.unfollow') }}
    </UiButton>

    <UiButton v-else-if="!userStore.isProfileSetup && isCurrentUser" variant="outline">
      <NuxtLink to="/setup/profile">
        {{ $t('profile.setup.setup-profile') }}
      </NuxtLink>
    </UiButton>
    <UiButton v-else-if="isCurrentUser" variant="outline">
      <NuxtLink to="/settings/profile">
        {{ $t('profile-info.edit-profile') }}
      </NuxtLink>
    </UiButton>
  </div>
</template>
