<script lang="ts" setup>
import { useIsCurrentUser } from '@/composables/useIsCurrentUser';
import { profileInteractionService } from '~/services/profile/profileInteractionService';

const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isFollower = computed(() => user?.value.relationship.follower || false);
const isFollowing = computed(() => user?.value.relationship.following || false);

const { mutate: blockUser } = useProfileMutation<'block' | 'unblock'>({
  mutationFn: async (action) => {
    if (!user?.value) return;
    return action === 'block'
      ? profileInteractionService.blockUser(user.value.username)
      : profileInteractionService.unblockUser(user.value.username);
  },
  username: user?.value.username,
  optimisticUpdateFn: (data, action) => {
    if (action === 'block') {
      data.relationship.blocking = true;
    } else {
      data.relationship.blocking = false;
    }
  },
});

const { mutate: muteUser } = useProfileMutation<'mute' | 'unmute'>({
  mutationFn: async (action) => {
    if (!user?.value) return;
    return action === 'mute'
      ? profileInteractionService.muteUser(user.value.username)
      : profileInteractionService.unmuteUser(user.value.username);
  },
  username: user?.value.username,
  optimisticUpdateFn: (data, action) => {
    if (action === 'mute') {
      data.relationship.muted = true;
    } else {
      data.relationship.muted = false;
    }
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
