<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import EmojiPickerPrimitive from 'vue-frimousse';
import { cn } from '@/utils/index';

interface Props {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <EmojiPickerPrimitive.Root
    :class="
      cn(
        'border-border bg-popover text-popover-foreground isolate flex h-full w-fit flex-col overflow-hidden rounded-md border',
        props.class,
      )
    "
    data-slot="emoji-picker"
    v-bind="$attrs"
  >
    <slot />
  </EmojiPickerPrimitive.Root>
</template>
