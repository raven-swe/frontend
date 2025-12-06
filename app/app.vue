<script setup lang="ts">
import { useHead } from '#app';
import { useI18n } from '#imports';
import { useTheme } from '~/composables/useTheme';

const { locale, localeProperties } = useI18n();
useTheme();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: localeProperties.value.dir,
    // class: 'dark',
  },
}));

const userStore = useUserStore();

const {
  connect: connectDmSse,
  disconnect: disconnectDmSse,

  unseenCount,
  lastNewMessageinfo,
} = useDmSse({
  autoReconnect: true,
  maxReconnectAttempts: 5,
  baseReconnectDelay: 1000,
});

const { addHighlight } = useDmHighlight();

// Track processed messages to avoid duplicates
const lastProcessedMessageId = ref<string | null>(null);
provide('dmUnseenCount', unseenCount);
provide('lastNewMessageinfo', lastNewMessageinfo);

watch(
  () => lastNewMessageinfo.value,
  (newMessage) => {
    if (!newMessage) return;

    // Skip if we've already processed this message
    if (newMessage.messageId === lastProcessedMessageId.value) return;

    lastProcessedMessageId.value = newMessage.messageId;

    const senderUsername = newMessage.sender.username;
    const currentUsername = userStore.user.username;

    // Only highlight if the sender is NOT the current user
    const shouldHighlight = senderUsername !== currentUsername;

    if (shouldHighlight) {
      addHighlight(newMessage.conversationId);
    }
  },
  { immediate: false },
);

watch(
  () => userStore.user,
  (newUser, oldUser) => {
    if (newUser.username && !oldUser?.username) {
      connectDmSse();
    } else if (!newUser.username && oldUser?.username) {
      disconnectDmSse();
    }
  },
  { immediate: true },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <UiToaster position="bottom-right" />
  </NuxtLayout>
</template>
