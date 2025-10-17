<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex h-fit flex-col items-center justify-center gap-4', props.class)"
  >
    <slot />
  </div>
</template>
