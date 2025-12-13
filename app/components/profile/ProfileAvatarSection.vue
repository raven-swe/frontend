<script lang="ts" setup>
import { useIsCurrentUser } from '~/composables/useIsCurrentUser';
import { useUserStore } from '~/stores/user';
import FollowToggleButton from '../ui/FollowToggleButton.vue';
import BlockToggleButton from '../ui/BlockToggleButton.vue';
const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isMuted = computed(() => user?.value.relationship.muted || false);
const isBlocked = computed(() => user?.value.relationship.blocking || false);
const relationship = computed(() => user?.value.relationship);

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
      <UserActionDropdown
        :is-muted="isMuted"
        :is-blocked="isBlocked"
        :username="user?.username || ''"
      >
        <UiButton data-test="profile-actions-trigger" variant="outline" size="icon-sm">
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
