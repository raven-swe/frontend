<script lang="ts" setup>
import { useIsCurrentUser } from '~/composables/useIsCurrentUser';
import { useUserStore } from '~/stores/user';
import FollowToggleButton from '../ui/FollowToggleButton.vue';
import BlockToggleButton from '../ui/BlockToggleButton.vue';
import AvatarModal from './ProfileAvatarModal.vue';
const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isMuted = computed(() => user?.value.relationship.muted || false);
const isBlocked = computed(() => user?.value.relationship.blocking || false);
const relationship = computed(() => user?.value.relationship);
const isAvatarModalOpen = ref(false);

const { mutate: blockUser } = useBlockMutation();
const { mutate: followUser } = useFollowMutation();

const handleBlock = (action: 'block' | 'unblock') => {
  blockUser({ action, username: user?.value.username || '' });
};

const handleFollow = (action: 'follow' | 'unfollow') => {
  followUser({ action, username: user?.value.username || '' });
};
</script>
<template>
  <div class="mx-4 -mt-16 flex items-center justify-between gap-4">
    <UiAvatar
      :img="user?.avatarUrl || ''"
      alt="Profile picture"
      size="xl"
      data-cy="profile-avatar"
      loading="eager"
      class="outline-background outline-4"
      data-testid="profile-avatar"
      @click="isAvatarModalOpen = true"
    />
    <AvatarModal
      v-if="isAvatarModalOpen"
      :avatar-img="user?.avatarUrl"
      @close="isAvatarModalOpen = false"
    />
    <div
      v-if="!isCurrentUser"
      class="mt-15 flex items-center gap-2"
      data-test="profile-action-buttons"
    >
      <UserActionDropdown
        :is-muted="isMuted"
        :is-blocked="isBlocked"
        :username="user?.username || ''"
      >
        <UiButton
          data-test="profile-actions-trigger"
          variant="outline"
          size="icon-sm"
          data-cy="profile-action-buttons"
        >
          <Icon name="lucide:more-horizontal" size="20" />
        </UiButton>
      </UserActionDropdown>

      <BlockToggleButton
        v-if="relationship?.blocking"
        :relationship="
          relationship || {
            following: false,
            follower: false,
            muted: false,
            blocking: false,
            blockedBy: false,
          }
        "
        @block="() => handleBlock('block')"
        @unblock="() => handleBlock('unblock')"
      />
      <FollowToggleButton
        v-else
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
      />
    </div>
    <UiButton
      v-else-if="!userStore.isProfileSetup && isCurrentUser"
      data-test="setup-profile-button"
      variant="outline"
      size="xs"
      class="mt-15"
    >
      <NuxtLink to="/setup/profile" data-cy="profile-setup-button" class="font-extrabold">
        {{ $t('profile.setup.setup-profile') }}
      </NuxtLink>
    </UiButton>
    <UiButton
      v-else-if="isCurrentUser"
      data-test="edit-profile-button"
      variant="outline"
      size="xs"
      class="mt-15"
    >
      <NuxtLink to="/settings/profile" data-cy="profile-edit-button" class="font-extrabold">
        {{ $t('profile-info.edit-profile') }}
      </NuxtLink>
    </UiButton>
  </div>
</template>
