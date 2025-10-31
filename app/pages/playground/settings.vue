<script setup lang="ts">
import { birthDateFormat } from '#imports';
import SettingsItem from './settingsItem.vue';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const user = computed(() => userStore.user);
</script>
<template>
  <div v-if="user" class="mt-10 flex flex-col gap-3 overflow-hidden">
    <SettingsItem
      :title="$t('setting.username.username')"
      :subtitle="`@${user.username}`"
      to="/playground/usernameEditor"
    />
    <SettingsItem
      :title="$t('setting.email')"
      :subtitle="`${user.email}`"
      to="/playground/settings/email"
    />
    <SettingsItem
      :title="$t('setting.date-of-birth')"
      :subtitle="birthDateFormat(user.birthDate, $i18n.locale)"
      to="/settings/profile"
    />
    <SettingsItem
      :title="$t('setting.change-password')"
      to="/playground/changePasswordEditor"
      subtitle="Change Your Password at any time"
    />
  </div>
  <div v-else class="p-4">
    <p class="text-red-500">{{ $t('setting.failed-to-load-user') }}</p>
  </div>
</template>
