<script setup lang="ts">
import type { User } from '~~/shared/types/user';
import { birthDateFormat } from '#imports';
import SettingsItem from './settingsItem.vue';
const user = ref<User | null>(null);

const { data: userData, error } = await useFetch<{ data: User }>('/api/user/Danika80');
user.value = userData.value?.data || null;
if (error.value) console.error(error.value);
</script>
<template>
  <div v-if="user" class="mt-10 flex flex-col gap-3 overflow-hidden">
    <SettingsItem
      :title="$t('setting.username')"
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
      to="/playground/settings/date-of-birth"
    />
    <SettingsItem
      :title="$t('setting.change-password')"
      to="/playground/settings/change-password"
    />
  </div>
  <div v-else class="p-4">
    <p class="text-red-500">{{ $t('setting.failed-to-load-user') }}</p>
  </div>
</template>
