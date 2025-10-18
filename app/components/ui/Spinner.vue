<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/index';

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    size?: string | number;
  }>(),
  {
    size: '2rem',
  },
);
</script>

<template>
  <Icon
    name="mingcute:loading-3-fill"
    role="status"
    mode="svg"
    :size="props.size"
    :aria-label="$t('ui.loading')"
    :class="cn('!block animate-spin', props.class)"
  />
</template>
