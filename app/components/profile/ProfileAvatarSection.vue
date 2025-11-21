<script lang="ts" setup>
import { useIsCurrentUser } from '@/composables/useIsCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { profileInteractionService } from '~/services/profile/profileInteractionService';

const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isFollower = computed(() => user?.value.relationship.follower || false);
const isFollowing = computed(() => user?.value.relationship.following || false);

const queryClient = useQueryClient();

const { mutate: blockUser } = useMutation({
  mutationFn: async (action: 'block' | 'unblock') => {
    if (!user?.value) return;
    return action === 'block'
      ? profileInteractionService.blockUser(user.value.username)
      : profileInteractionService.unblockUser(user.value.username);
  },

  onMutate: async (action: 'block' | 'unblock') => {
    const queryKey = ['profile', user?.value.username];

    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Get previous data
    const previousData = queryClient.getQueryData<ApiSuccessResponse<User>>(queryKey);

    if (previousData?.data) {
      const updatedUser = { ...previousData.data };

      // Optimistic update
      if (action === 'block') {
        updatedUser.relationship.blocking = true;
      } else {
        updatedUser.relationship.blocking = false;
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
      queryClient.setQueryData(['profile', user?.value.username], ctx.previousData);
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

const { mutate: muteUser } = useMutation({
  mutationFn: async (action: 'mute' | 'unmute') => {
    if (!user?.value) return;
    return action === 'mute'
      ? profileInteractionService.muteUser(user.value.username)
      : profileInteractionService.unmuteUser(user.value.username);
  },

  onMutate: async (action: 'mute' | 'unmute') => {
    const queryKey = ['profile', user?.value.username];

    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Get previous data
    const previousData = queryClient.getQueryData<ApiSuccessResponse<User>>(queryKey);

    if (previousData?.data) {
      const updatedUser = { ...previousData.data };

      // Optimistic update
      if (action === 'mute') {
        updatedUser.relationship.muted = true;
      } else {
        updatedUser.relationship.muted = false;
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
      queryClient.setQueryData(['profile', user?.value.username], ctx.previousData);
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
    <div v-if="!isCurrentUser" class="flex items-center gap-2">
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton variant="outline" size="icon-lg">
            <Icon name="lucide:more-horizontal" size="20" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end">
          <UiDropdownMenuItem @click="muteUser(user?.relationship.muted ? 'unmute' : 'mute')">
            <Icon
              :name="user?.relationship.muted ? 'lucide:volume' : 'lucide:volume-off'"
              size="18"
            />
            {{ user?.relationship.muted ? $t('ui.unmute') : $t('ui.mute') }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="blockUser(user?.relationship.blocking ? 'unblock' : 'block')">
            <Icon name="lucide:ban" size="18" class="text-foreground" />
            {{ user?.relationship.blocking ? $t('ui.unblock') : $t('ui.block') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>

      <ProfileActionsFollowToggleButton
        v-if="!isCurrentUser"
        :username="user?.username || ''"
        :follower="isFollower"
        :following="isFollowing"
      />
    </div>
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
