<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Avatar from '@/components/ui/Avatar.vue';
import { ref } from 'vue';

const props = defineProps<{
  user: User;
  isOnboarding?: boolean;
}>();

const emit = defineEmits<{
  (e: 'follow' | 'unfollow', username: string): void;
}>();

const isHovered = ref(false);
const isFollowing = computed(() => props.user.relationship?.following || false);

const handleToggleFollow = () => {
  if (isFollowing.value) {
    handleUnfollow();
  } else {
    handleFollow();
  }
};

const handleFollow = () => {
  emit('follow', props.user.username);
};

const handleUnfollow = () => {
  emit('unfollow', props.user.username);
};

const handleCardClick = () => {
  if (props.isOnboarding) {
    handleToggleFollow();
  }
};
</script>

<template>
  <div
    class="hover:bg-foreground/5 flex w-full max-w-full gap-3 px-4 py-3 transition-all duration-200"
    :class="{
      'cursor-pointer': isOnboarding,
    }"
    @click="handleCardClick"
  >
    <UiHoverCard v-if="!isOnboarding">
      <NuxtLink :to="`users/${user.username}`">
        <UiHoverCardTrigger>
          <Avatar size="sm" :img="user.avatarUrl" />
        </UiHoverCardTrigger>
      </NuxtLink>
      <UiHoverCardContent :align-offset="20" class="w-80">
        <UiUserMetadata :user="user" @follow="handleFollow" @unfollow="handleUnfollow" />
      </UiHoverCardContent>
    </UiHoverCard>
    <Avatar v-else size="sm" :img="user.avatarUrl" />
    <div class="w-full">
      <div class="flex items-center justify-between">
        <UiHoverCard v-if="!isOnboarding">
          <UiHoverCardTrigger>
            <NuxtLink :to="`users/${user.username}`">
              <div class="text-sm font-bold hover:underline">{{ user.displayName }}</div>
              <div class="text-muted-foreground text-sm">
                {{ '@' + user.username }}
              </div>
            </NuxtLink>
          </UiHoverCardTrigger>
          <UiHoverCardContent :align-offset="20" class="w-80">
            <UiUserMetadata :user="user" @follow="handleFollow" @unfollow="handleUnfollow" />
          </UiHoverCardContent>
        </UiHoverCard>
        <div v-else>
          <div class="text-sm font-bold">{{ user.displayName }}</div>
          <div class="text-muted-foreground text-sm">
            {{ '@' + user.username }}
          </div>
        </div>
        <div class="ms-auto">
          <Button
            v-if="isFollowing"
            variant="outline-destructive"
            size="md"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            @click.stop="handleUnfollow"
            >{{ isHovered ? $t('testing.unfollow') : $t('testing.following') }}</Button
          >
          <Button v-else variant="default" size="md" @click.stop="handleFollow">{{
            $t('testing.follow')
          }}</Button>
        </div>
      </div>
      <div>
        <p v-if="user.bio" class="text-sm">
          {{ user.bio.length > 100 ? user.bio.slice(0, 100) + '...' : user.bio }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
