<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';
const props = defineProps<{
  conversation: DmConversation;
  isSelected?: boolean;
}>();
// console.log('Rendering DmConversationItem for', props.conversation);
</script>
<template>
  <div
    class="flex min-w-0 items-center gap-2 border-e-2 p-4 transition-colors"
    :class="props.isSelected ? 'border-e-primary' : 'border-e-transparent'"
  >
    <div>
      <NuxtImg
        :src="props.conversation.participant.avatarUrl"
        alt="Profile picture"
        class="z-20 size-13 rounded-full border-1 object-cover"
        loading="eager"
      />
    </div>
    <div class="flex min-w-0 flex-col gap-0.5">
      <div class="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden text-sm">
        <span
          class="max-w-[110px] truncate font-bold"
          :title="props.conversation.participant.displayName"
        >
          {{ props.conversation.participant.displayName }}
        </span>
        <span
          class="text-muted-foreground max-w-[100px] truncate"
          :title="props.conversation.participant.username"
        >
          {{ '@' + props.conversation.participant.username }}
        </span>
        <span
          v-if="props.conversation.lastMessage?.sentAt"
          class="text-muted-foreground flex-shrink-0"
        >
          {{ relativeTime(props.conversation.lastMessage.sentAt) }}
        </span>
      </div>
      <div class="text-sm">
        <span class="text-muted-foreground">
          {{ props.conversation.lastMessage?.content || 'No messages yet' }}
        </span>
      </div>
    </div>
  </div>
</template>
