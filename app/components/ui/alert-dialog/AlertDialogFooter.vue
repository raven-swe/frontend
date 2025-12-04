<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div data-slot="alert-dialog-footer" :class="cn('flex flex-col gap-3', props.class)">
    <slot />
  </div>
</template>
