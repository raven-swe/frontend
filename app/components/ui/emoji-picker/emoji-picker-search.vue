<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import EmojiPickerPrimitive from 'vue-frimousse';
import { SearchIcon } from 'lucide-vue-next';
import { cn } from '@/utils/index';

interface Props {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="
      cn('bg-popover sticky top-0 z-10 flex h-9 items-center gap-2 border-b px-3', props.class)
    "
    data-slot="emoji-picker-search-wrapper"
  >
    <SearchIcon class="size-4 shrink-0 opacity-50" />
    <EmojiPickerPrimitive.Search
      class="placeholder:text-muted-foreground m-0 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      data-slot="emoji-picker-search"
      v-bind="$attrs"
    />
  </div>
</template>
