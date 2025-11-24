<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
import Avatar from '@/components/ui/Avatar.vue';
import { ref } from 'vue';
const isHovered = ref(false);
const props = defineProps<{
  user: User;
}>();
const emit = defineEmits<{
  (e: 'follow' | 'unfollow', username: string): void;
}>();
const isFollowing = computed(() => props.user.relationship?.following || false);

const followUser = () => {
  emit('follow', props.user.username);
};
const unfollowUser = () => {
  emit('unfollow', props.user.username);
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <header class="flex flex-1 items-start justify-between">
        <NuxtLink :to="`users/${user.username}`">
          <Avatar size="md" :img="user.avatarUrl" />
        </NuxtLink>
        <Button
          v-if="isFollowing"
          variant="outline-destructive"
          size="md"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
          @click.stop="unfollowUser"
          >{{ isHovered ? $t('testing.unfollow') : $t('testing.following') }}</Button
        >
        <Button v-else variant="default" size="md" @click.stop="followUser">{{
          $t('testing.follow')
        }}</Button>
      </header>
      <NuxtLink :to="`users/${user.username}`">
        <div class="text-sm font-bold hover:underline">{{ user.displayName }}</div>
        <div class="text-muted-foreground text-sm">
          {{ '@' + user.username }}
        </div>
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
</template>
