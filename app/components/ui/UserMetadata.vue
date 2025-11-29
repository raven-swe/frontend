<script lang="ts" setup>
import Avatar from '@/components/ui/Avatar.vue';
import { useQuery } from '@tanstack/vue-query';
import FollowToggleButton from './FollowToggleButton.vue';
import { profileTabsService } from '~/services/profile/profileTabsService';
const props = defineProps<{
  username: string;
}>();
const emit = defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock'): void;
}>();

const queryKey = computed(() => ['profile', props.username.toLowerCase()]);
const { data: user, isLoading } = useQuery({
  queryKey,
  queryFn: async ({ signal }) =>
    profileTabsService.getProfile(props.username.toLowerCase(), signal),
});

const followUser = () => {
  emit('follow');
};
const unfollowUser = () => {
  emit('unfollow');
};

const unblockUser = () => {
  emit('unblock');
};
</script>

<template>
  <div v-if="user" class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <header class="flex flex-1 items-start justify-between">
        <NuxtLink :to="`/profile/${user.username}`">
          <Avatar size="md" :img="user.avatarUrl" class="cursor-pointer" />
        </NuxtLink>
        <FollowToggleButton
          :relationship="user.relationship"
          @follow="followUser"
          @unfollow="unfollowUser"
          @unblock="unblockUser"
        />
      </header>
      <NuxtLink :to="`/profile/${user.username}`">
        <p class="text-sm font-bold hover:underline">{{ user.displayName }}</p>
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
    <p v-if="user.bio" class="text-sm">
      {{ user.bio }}
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
