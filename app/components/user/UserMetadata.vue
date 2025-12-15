<script lang="ts" setup>
import Avatar from '@/components/ui/Avatar.vue';
import { useQuery } from '@tanstack/vue-query';
import FollowToggleButton from '@/components/ui/FollowToggleButton.vue';
import { profileTabsService } from '~/services/profile/profileTabsService';
import BlockToggleButton from '@/components/ui/BlockToggleButton.vue';
const props = defineProps<{
  username: string;
}>();

const queryKey = computed(() => ['profile', props.username.toLowerCase()]);
const { data: user, isLoading } = useQuery({
  queryKey,
  queryFn: async ({ signal }) =>
    profileTabsService.getProfile(props.username.toLowerCase(), signal),
});

const userStore = useUserStore();
const isCurrentUser = computed(() => {
  return userStore.user?.username.toLowerCase() === props.username.toLowerCase();
});

const { mutate: followUser } = useFollowMutation();
const { mutate: unblockUser } = useBlockMutation();
</script>

<template>
  <div v-if="user" class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <header class="flex flex-1 items-start justify-between">
        <NuxtLink :to="`/profile/${user.username}`">
          <Avatar size="md" :img="user.avatarUrl" class="cursor-pointer" />
        </NuxtLink>
        <BlockToggleButton
          v-if="user.relationship?.blocking && !isCurrentUser"
          :relationship="user.relationship"
          @unblock="unblockUser({ username: user.username, action: 'unblock' })"
        />
        <FollowToggleButton
          v-else-if="!isCurrentUser"
          :relationship="user.relationship"
          @follow="followUser({ username: user.username, action: 'follow' })"
          @unfollow="followUser({ username: user.username, action: 'unfollow' })"
        />
      </header>
      <NuxtLink :to="`/profile/${user.username}`">
        <p class="line-clamp-1 truncate text-sm font-bold hover:underline">
          {{ user.displayName }}
        </p>
        <p class="text-muted-foreground cursor-pointer text-sm">
          {{ '@' + user.username }}
          <span
            v-if="user.relationship?.follower"
            class="bg-muted rounded-sm p-0.5 px-0.75 text-xs font-semibold"
          >
            {{ $t('ui.follows-you') }}
          </span>
        </p>
      </NuxtLink>
    </div>
    <p v-if="user.bio" class="text-sm break-all">
      <UiContentEntitiesRenderer :content="user.bio" :entities="user.bioEntities" />
    </p>
    <div class="flex gap-5">
      <span class="text-sm font-medium">
        {{ $n(user.followingCount, { notation: 'compact' }) }}
        <span class="text-muted-foreground font-light">
          {{ $t('profile-info.following') }}
        </span>
      </span>
      <span class="text-sm font-medium">
        {{ $n(user.followersCount, { notation: 'compact' }) }}
        <span class="text-muted-foreground font-light">
          {{ $t('profile-info.followers') }}
        </span>
      </span>
    </div>
  </div>
  <div v-if="isLoading" class="flex justify-center py-12">
    <UiSpinner class="text-primary" />
  </div>
</template>
