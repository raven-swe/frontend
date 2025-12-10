<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';

const props = defineProps<{
  conversation: DmConversation;
  isSelected?: boolean;
}>();

const userStore = useUserStore();

const highlighted = computed(() => {
  const lastMessage = props.conversation.lastMessage;
  if (!lastMessage) return false;
  const isNotSender = lastMessage.senderUsername !== userStore.user.username;
  return !lastMessage.seen && !props.isSelected && isNotSender;
});
</script>
<template>
  <div
    class="flex min-w-0 items-center gap-2 border-e-2 p-4 transition-colors"
    :class="[
      props.isSelected ? 'border-e-primary' : 'border-e-transparent',
      highlighted ? 'bg-foreground/5' : '',
    ]"
  >
    <div class="flex-shrink-0">
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
          class="max-w-[110px] truncate"
          :class="highlighted ? 'text-primary font-bold' : 'font-bold'"
          :title="props.conversation.participant.displayName"
        >
          {{ props.conversation.participant.displayName }}
        </span>
        <span
          class="max-w-[100px] truncate"
          :class="highlighted ? 'text-primary' : 'text-muted-foreground'"
          :title="props.conversation.participant.username"
        >
          {{ '@' + props.conversation.participant.username }}
        </span>
        <span
          v-if="props.conversation.lastMessage?.sentAt"
          class="flex-shrink-0"
          :class="highlighted ? 'text-primary' : 'text-muted-foreground'"
        >
          {{ relativeTime(props.conversation.lastMessage.sentAt) }}
        </span>
      </div>
      <div class="min-w-0 text-sm">
        <span
          class="block truncate"
          :class="highlighted ? 'text-primary font-bold' : 'text-muted-foreground'"
        >
          {{ props.conversation.lastMessage?.content || 'No messages yet' }}
        </span>
      </div>
    </div>
  </div>
</template>
