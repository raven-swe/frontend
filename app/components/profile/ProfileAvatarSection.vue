<script lang="ts" setup>
import { useIsCurrentUser } from '~/composables/useIsCurrentUser';
import { profileInteractionService } from '~/services/profile/profileInteractionService';
import { useProfileMutation } from '~/composables/useProfileMutation';
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isFollower = computed(() => user?.value.relationship.follower || false);
const isFollowing = computed(() => user?.value.relationship.following || false);
const isMuted = computed(() => user?.value.relationship.muted || false);
const isBlocked = computed(() => user?.value.relationship.blocking || false);

const { mutate: blockUser } = useProfileMutation<'block' | 'unblock'>({
  mutationFn: async (action) => {
    if (!user?.value) return;
    return action === 'block'
      ? profileInteractionService.blockUser(user.value.username)
      : profileInteractionService.unblockUser(user.value.username);
  },
  username: user?.value.username ?? '',
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
  username: user?.value.username ?? '',
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
    <div v-if="!isCurrentUser" class="flex items-center gap-2" data-test="profile-action-buttons">
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton data-test="profile-actions-trigger" variant="outline" size="icon-lg">
            <Icon name="lucide:more-horizontal" size="20" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end">
          <UiDropdownMenuItem
            data-test="mute-button"
            @click="muteUser(isMuted ? 'unmute' : 'mute')"
          >
            <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
            {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            data-test="block-button"
            @click="blockUser(isBlocked ? 'unblock' : 'block')"
          >
            <Icon name="lucide:ban" size="18" class="text-foreground" />
            {{ isBlocked ? $t('ui.unblock') : $t('ui.block') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>

      <ProfileActionsFollowToggleButton
        v-if="!isCurrentUser && !user?.relationship.blockedBy"
        :username="user?.username || ''"
        :follower="isFollower"
        :following="isFollowing"
      />
    </div>
    <UiButton
      v-else-if="!userStore.isProfileSetup && isCurrentUser"
      data-test="setup-profile-button"
      variant="outline"
    >
      <NuxtLink to="/setup/profile">
        {{ $t('profile.setup.setup-profile') }}
      </NuxtLink>
    </UiButton>
    <UiButton v-else-if="isCurrentUser" data-test="edit-profile-button" variant="outline">
      <NuxtLink to="/settings/profile">
        {{ $t('profile-info.edit-profile') }}
      </NuxtLink>
    </UiButton>
  </div>
</template>
