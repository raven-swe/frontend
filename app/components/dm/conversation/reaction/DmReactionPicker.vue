<script lang="ts" setup>
import Popover from '@/components/ui/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';

defineProps<{
  isMine: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', emoji: string): void;
}>();

const isOpen = ref(false);

// Simple emoji list for reactions
const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

const selectEmoji = (emoji: string) => {
  emit('select', emoji);
  isOpen.value = false;
};
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        class="bg-background hover:bg-accent absolute -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border text-xs opacity-0 shadow-sm transition-all group-hover:opacity-100"
        :class="isMine ? '-left-1' : '-right-1'"
        :title="$t('dm.reaction.add')"
        data-cy="dm-reaction-picker-button"
      >
        <Icon name="lucide:smile-plus" class="text-muted-foreground h-3 w-3" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-1" side="top" :side-offset="4">
      <div class="flex gap-1">
        <button
          v-for="emoji in emojis"
          :key="emoji"
          class="hover:bg-accent rounded p-1 text-lg transition-colors"
          data-cy="dm-reaction-picker-emoji"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
