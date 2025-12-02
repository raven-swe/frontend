<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import EmojiPickerPrimitive from 'vue-frimousse';
import { LoaderIcon } from 'lucide-vue-next';
import { cn } from '@/utils/index';

interface Props {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <EmojiPickerPrimitive.Viewport
    :class="cn('bg-popover relative flex-1 outline-hidden', props.class)"
    data-slot="emoji-picker-viewport"
    v-bind="$attrs"
  >
    <EmojiPickerPrimitive.Loading
      class="text-muted-foreground absolute inset-0 flex items-center justify-center"
      data-slot="emoji-picker-loading"
    >
      <LoaderIcon class="size-4 animate-spin" />
    </EmojiPickerPrimitive.Loading>

    <EmojiPickerPrimitive.Empty
      class="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm"
      data-slot="emoji-picker-empty"
    >
      {{ $t('tweet.composer.no-emojis') }}
    </EmojiPickerPrimitive.Empty>

    <EmojiPickerPrimitive.List
      class="pb-1 select-none"
      data-slot="emoji-picker-list"
      row-class="scroll-my-1 px-1"
    >
      <template #category-header="{ category }">
        <slot name="category-header" :category="category">
          <UiEmojiPickerCategoryHeader :category="category" />
        </slot>
      </template>
      <template #emoji="{ emoji }">
        <slot name="emoji" :emoji="emoji">
          <UiEmojiPickerEmoji :emoji="emoji" />
        </slot>
      </template>
    </EmojiPickerPrimitive.List>
  </EmojiPickerPrimitive.Viewport>
</template>
