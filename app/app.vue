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
  },
}));

const userStore = useUserStore();

const {
  connect: connectDmSse,
  disconnect: disconnectDmSse,

  unseenCount,
  lastNewMessageinfo,
  lastNotification,
  unseenNotificationsCount,
} = useDmSse({
  autoReconnect: true,
  maxReconnectAttempts: 5,
  baseReconnectDelay: 1000,
});

provide('dmUnseenCount', unseenCount);
provide('lastNewMessageinfo', lastNewMessageinfo);
provide('lastNotification', lastNotification);
provide('unseenNotificationsCount', unseenNotificationsCount);

watch(
  () => userStore.user,
  (newUser, oldUser) => {
    if (newUser?.username && !oldUser?.username) {
      connectDmSse();
    } else if (!newUser?.username && oldUser?.username) {
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
