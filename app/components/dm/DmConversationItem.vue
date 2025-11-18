<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';
const props = defineProps<{
  conversation: DmConversation;
  isSelected?: boolean;
}>();
</script>
<template>
  <div
    class="flex items-center gap-2 border-r-2 p-4 transition-colors"
    :class="props.isSelected ? 'border-r-primary' : 'border-r-transparent'"
  >
    <div>
      <NuxtImg
        :src="props.conversation.participant.avatarUrl"
        alt="Profile picture"
        class="z-20 size-13 rounded-full border-1 object-cover"
        loading="eager"
      />
    </div>
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2 text-sm">
        <span class="font-bold">
          {{ props.conversation.participant.displayName }}
        </span>
        <span class="text-muted-foreground">
          {{ props.conversation.participant.username }}
        </span>
        <span class="text-muted-foreground">
          {{ props.conversation.lastMessage.sentAt }}
        </span>
      </div>
      <div class="text-sm">
        <span class="text-muted-foreground">
          {{ props.conversation.lastMessage.content }}
        </span>
      </div>
    </div>
  </div>
</template>
