<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/index';

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    size?: string | number;
  }>(),
  {
    size: '1rem',
  },
);
</script>

<template>
  <Icon
    name="lucide:loader-circle"
    role="status"
    mode="svg"
    :size="props.size"
    :aria-label="$t('ui.loading')"
    :class="cn('!block size-4 animate-spin', props.class)"
  />
</template>
