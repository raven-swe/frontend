<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';

const props = defineProps<{ conversation: DmConversation | null }>();

const username = computed(() => props.conversation?.participant.username || '');
const displayName = computed(() => props.conversation?.participant.displayName || '');
const avatarUrl = computed(() => props.conversation?.participant.avatarUrl || '');
</script>
<template>
  <div v-if="props.conversation" class="p-4">
    <NuxtLink
      :to="`/profile/${username}`"
      class="hover:bg-foreground/10 flex cursor-pointer flex-col items-center pt-4 pb-20"
      data-cy="dm-conversation-info-link"
    >
      <NuxtImg
        :src="avatarUrl"
        alt="Profile picture"
        class="z-20 size-14 rounded-full border-1 object-cover"
        loading="eager"
        data-cy="dm-conversation-info-avatar"
      />
      <span class="text-md font-bold" data-cy="dm-conversation-info-name">{{ displayName }}</span>
      <span class="text-md text-muted-foreground" data-cy="dm-conversation-info-username">
        {{ '@' + username }}
      </span>
    </NuxtLink>
  </div>
</template>
