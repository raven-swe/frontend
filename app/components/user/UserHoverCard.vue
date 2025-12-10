<script lang="ts" setup>
import UserMetadata from '@/components/user/UserMetadata.vue';

defineProps<{
  username: string;
}>();

defineEmits<{
  (e: 'follow' | 'unfollow' | 'unblock'): void;
}>();
</script>

<template>
  <UiHoverCard>
    <UiHoverCardTrigger as-child>
      <slot />
    </UiHoverCardTrigger>
    <UiHoverCardContent>
      <UserMetadata
        :username="username"
        @follow="$emit('follow')"
        @unfollow="$emit('unfollow')"
        @unblock="$emit('unblock')"
      />
    </UiHoverCardContent>
  </UiHoverCard>
</template>
