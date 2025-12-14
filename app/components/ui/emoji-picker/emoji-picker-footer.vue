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
  <div
    :class="
      cn(
        'bg-popover flex w-full max-w-[var(--frimousse-viewport-width)] min-w-0 items-center gap-1 border-t p-2',
        props.class,
      )
    "
    data-slot="emoji-picker-footer"
    v-bind="$attrs"
  >
    <EmojiPickerPrimitive.ActiveEmoji v-slot="{ emoji }">
      <div class="flex w-full items-center justify-between">
        <template v-if="emoji">
          <div class="flex flex-1 items-center gap-1">
            <div class="flex size-7 flex-none items-center justify-center text-lg">
              {{ emoji.emoji }}
            </div>
            <span class="text-secondary-foreground truncate text-xs">{{ emoji.label }}</span>
          </div>
        </template>
        <template v-else>
          <span class="text-muted-foreground ms-1.5 flex h-7 items-center truncate text-xs">
            {{ $t('tweet.composer.select-emoji') }}
          </span>
        </template>
      </div>
    </EmojiPickerPrimitive.ActiveEmoji>
  </div>
</template>
