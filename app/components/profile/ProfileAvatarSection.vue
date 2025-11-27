<script lang="ts" setup>
import { useIsCurrentUser } from '~/composables/useIsCurrentUser';
import { useUserStore } from '~/stores/user';
import FollowToggleButton from '../ui/FollowToggleButton.vue';
const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isMuted = computed(() => user?.value.relationship.muted || false);
const isBlocked = computed(() => user?.value.relationship.blocking || false);
const relationship = computed(() => user?.value.relationship);

const { mutate: muteUser } = useMuteMutation(user?.value.username || '');
const { mutate: blockUser } = useBlockMutation(user?.value.username || '');
const { mutate: followUser } = useFollowMutation(user?.value.username || '');

const handleMute = (action: 'mute' | 'unmute') => {
  muteUser({ action, username: user?.value.username || '' });
};
const handleBlock = (action: 'block' | 'unblock') => {
  blockUser({ action, username: user?.value.username || '' });
};

const handleFollow = (action: 'follow' | 'unfollow') => {
  followUser({ action, username: user?.value.username || '' });
};
</script>
<template>
  <div class="mx-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <NuxtImg
        :src="user?.avatarUrl || ''"
        alt="Profile picture"
        class="z-20 -mt-16 size-34 rounded-full border-4 object-cover"
        data-cy="profile-avatar"
        loading="eager"
      />
    </div>
    <div v-if="!isCurrentUser" class="flex items-center gap-2" data-test="profile-action-buttons">
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton data-test="profile-actions-trigger" variant="outline" size="icon-md">
            <Icon name="lucide:more-horizontal" size="20" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end">
          <UiDropdownMenuItem
            data-test="mute-button"
            @click="() => handleMute(isMuted ? 'unmute' : 'mute')"
          >
            <Icon :name="isMuted ? 'lucide:volume' : 'lucide:volume-off'" size="18" />
            {{ isMuted ? $t('ui.unmute') : $t('ui.mute') }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            data-test="block-button"
            @click="() => handleBlock(isBlocked ? 'unblock' : 'block')"
          >
            <Icon name="lucide:ban" size="18" class="text-foreground" />
            {{ isBlocked ? $t('ui.unblock') : $t('ui.block') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>

      <FollowToggleButton
        :relationship="
          relationship || {
            following: false,
            follower: false,
            muted: false,
            blocking: false,
            blockedBy: false,
          }
        "
        @follow="() => handleFollow('follow')"
        @unfollow="() => handleFollow('unfollow')"
        @unblock="() => handleBlock('unblock')"
      />
    </div>
    <UiButton
      v-else-if="!userStore.isProfileSetup && isCurrentUser"
      data-test="setup-profile-button"
      variant="outline"
    >
      <NuxtLink to="/setup/profile" data-cy="profile-setup-button">
        {{ $t('profile.setup.setup-profile') }}
      </NuxtLink>
    </UiButton>
    <UiButton v-else-if="isCurrentUser" data-test="edit-profile-button" variant="outline">
      <NuxtLink to="/settings/profile" data-cy="profile-edit-button">
        {{ $t('profile-info.edit-profile') }}
      </NuxtLink>
    </UiButton>
  </div>
</template>
