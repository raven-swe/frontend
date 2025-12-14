<script lang="ts" setup>
import type { DmWsUserTyping, DmWsUserTypingStop } from '~~/shared/types/dm';

const props = defineProps<{
  conversationId: string | null;
}>();

const dmSocket = inject<ReturnType<typeof useDmSocketIO>>('dmSocket');
const userStore = useUserStore();
const currentUsername = computed(() => userStore.user.username);

const typingUsername = ref<string | null>(null);

onMounted(() => {
  if (!dmSocket) return;

  dmSocket.onUserTyping((data: Omit<DmWsUserTyping, 'type'>) => {
    if (data.conversationId === props.conversationId && data.username !== currentUsername.value) {
      typingUsername.value = data.username;
    }
  });

  dmSocket.onUserTypingStop((data: Omit<DmWsUserTypingStop, 'type'>) => {
    if (data.conversationId === props.conversationId && data.username === typingUsername.value) {
      typingUsername.value = null;
    }
  });
});

watch(
  () => props.conversationId,
  () => {
    typingUsername.value = null;
  },
);
</script>

<template>
  <div v-if="typingUsername" class="flex items-center gap-2 px-4 py-2">
    <div class="flex items-center gap-1">
      <span
        class="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"
      />
      <span
        class="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"
      />
      <span class="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full" />
    </div>
    <span class="text-muted-foreground text-sm">
      {{ $t('dm.typing', { username: typingUsername }) }}
    </span>
  </div>
</template>
