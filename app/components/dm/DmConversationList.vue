<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';

const props = defineProps<{
  conversations: DmConversation[];
  selectedId: string | null;
}>();

const emit = defineEmits<{ (e: 'select', id: string): void }>();
</script>

<template>
  <div class="flex flex-col">
    <DmConversationItem
      v-for="conversation in props.conversations"
      :key="conversation.id"
      :conversation="conversation"
      :is-selected="props.selectedId === conversation.id"
      class="hover:bg-foreground/5 cursor-pointer"
      @click="emit('select', conversation.id)"
    />
  </div>
</template>
