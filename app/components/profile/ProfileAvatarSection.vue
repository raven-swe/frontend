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
    <div v-if="!isCurrentUser" class="flex items-center gap-2">
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiButton variant="outline" size="icon-lg">
            <Icon name="lucide:more-horizontal" size="20" />
          </UiButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="end">
          <UiDropdownMenuItem>
            <Icon name="lucide:volume-off" size="18" />
            {{ $t('ui.mute') }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem>
            <Icon name="lucide:ban" size="18" class="text-foreground" />
            {{ $t('ui.block') }}
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
