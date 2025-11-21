<script lang="ts" setup>
import { useIsCurrentUser } from '@/composables/useIsCurrentUser';

const userStore = useUserStore();

const { isCurrentUser } = useIsCurrentUser();

const user = inject<ComputedRef<User>>('user-data');

const isFollower = computed(() => user?.value.relationship.follower || false);
const isFollowing = computed(() => user?.value.relationship.following || false);
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
    <ProfileActionsFollowToggleButton
      v-if="!isCurrentUser"
      :username="user?.username || ''"
      :follower="isFollower"
      :following="isFollowing"
    />

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
