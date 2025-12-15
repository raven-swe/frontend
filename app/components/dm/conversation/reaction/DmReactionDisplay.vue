<script lang="ts" setup>
import type { DmMessageReactions } from '~~/shared/types/dm';
import HoverCard from '@/components/ui/hover-card/HoverCard.vue';
import HoverCardContent from '@/components/ui/hover-card/HoverCardContent.vue';
import HoverCardTrigger from '@/components/ui/hover-card/HoverCardTrigger.vue';
import Avatar from '@/components/ui/Avatar.vue';

const props = defineProps<{
  reactions: DmMessageReactions;
  isMine: boolean;
}>();

const emit = defineEmits<{
  (e: 'remove', reaction: string): void;
}>();

const userStore = useUserStore();
const currentUsername = computed(() => userStore.user?.username);

const displayReaction = computed(() => {
  if (props.isMine) {
    return props.reactions.receiver?.reaction ? props.reactions.receiver : null;
  } else {
    return props.reactions.receiver?.reaction ? props.reactions.receiver : null;
  }
});

const canRemove = computed(() => {
  if (!displayReaction.value) return false;
  return displayReaction.value.username === currentUsername.value;
});

const handleClick = () => {
  if (canRemove.value && displayReaction.value?.reaction) {
    emit('remove', displayReaction.value.reaction);
  }
};
</script>

<template>
  <div
    v-if="displayReaction"
    class="absolute -bottom-2"
    :class="isMine ? '-left-1' : '-right-1'"
    data-cy="dm-reaction-display"
  >
    <HoverCard :open-delay="200" :close-delay="100">
      <HoverCardTrigger as-child>
        <button
          class="bg-background hover:bg-accent flex h-5 items-center justify-center rounded-full border px-1 text-xs shadow-sm transition-colors"
          :class="canRemove ? 'cursor-pointer' : 'cursor-default'"
          :title="canRemove ? $t('dm.reaction.remove') : undefined"
          data-cy="dm-reaction-display-button"
          @click="handleClick"
        >
          {{ displayReaction.reaction }}
        </button>
      </HoverCardTrigger>
      <HoverCardContent class="w-auto min-w-[120px] p-2" side="top">
        <div class="flex items-center gap-2">
          <Avatar :img="displayReaction.avatarUrl" size="xs" variant="secondary" />
          <span class="text-sm font-medium" data-cy="dm-reaction-display-name">{{
            displayReaction.displayName
          }}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
</template>
