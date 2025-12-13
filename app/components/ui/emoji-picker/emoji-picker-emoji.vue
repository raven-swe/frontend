<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/index';

interface Props {
  emoji: {
    emoji: string;
    isActive: boolean;
    label?: string;
  };
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <button
    v-bind="$attrs"
    :class="
      cn(
        'flex size-7 items-center justify-center rounded-sm text-base',
        props.emoji.isActive && 'bg-accent',
        props.class,
      )
    "
    data-slot="emoji-picker-emoji"
  >
    {{ props.emoji.emoji }}
  </button>
</template>
