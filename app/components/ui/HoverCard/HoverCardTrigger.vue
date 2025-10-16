<script setup lang="ts">
import type { HoverCardTriggerProps } from 'reka-ui';
import { HoverCardTrigger } from 'reka-ui';

const props = defineProps<HoverCardTriggerProps>();
</script>

<template>
  <HoverCardTrigger
    class="inline-block cursor-pointer rounded-full outline-none"
    data-slot="hover-card-trigger"
    v-bind="props"
  >
    <slot />
  </HoverCardTrigger>
</template>
