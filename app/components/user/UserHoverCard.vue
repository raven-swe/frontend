<script lang="ts" setup>
import UserMetadata from '@/components/user/UserMetadata.vue';

defineProps<{
  username: string;
}>();
</script>

<template>
  <UiHoverCard>
    <UiHoverCardTrigger as-child>
      <slot />
    </UiHoverCardTrigger>
    <UiHoverCardContent>
      <UserMetadata :username="username" />
    </UiHoverCardContent>
  </UiHoverCard>
</template>
