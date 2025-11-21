<script setup lang="ts">
import { birthDateFormat } from '#imports';
import SettingsItem from '../../playground/settingsItem.vue';
import { useUserStore } from '~/stores/user';
import { useI18n } from 'vue-i18n';
const { t, locale: $i18n } = useI18n();
definePageMeta({ layout: false });
const userStore = useUserStore();
const user = computed(() => userStore.user);
const birthDate = computed(() =>
  user.value?.birthDate ? birthDateFormat(user.value.birthDate, $i18n.value) : '',
);
</script>

<template>
  <!-- This page now only provides RIGHT slot content via parent account.vue -->
  <div>
    <div class="p-4">
      <h1 class="text-2xl font-bold">{{ t('setting.account-information') }}</h1>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ t('setting.account-information-details') }}
      </p>
    </div>
    <div v-if="user" class="mt-3 flex flex-col gap-3 overflow-hidden">
      <SettingsItem
        :title="t('setting.username.username')"
        :subtitle="`@${user.username}`"
        to="/settings/account/username"
      />
      <SettingsItem
        :title="t('setting.change-email.label')"
        :subtitle="`${user.email}`"
        to="/settings/account/email"
      />
      <SettingsItem
        :title="t('setting.date-of-birth')"
        :subtitle="birthDate"
        to="/settings/profile"
      />
      <SettingsItem
        :title="t('setting.change-password')"
        to="/settings/account/changePasswordEditor"
        subtitle="Change Your Password at any time"
      />
    </div>
    <div v-else class="p-4">
      <p class="text-red-500">{{ $t('setting.failed-to-load-user') }}</p>
    </div>
  </div>
</template>
