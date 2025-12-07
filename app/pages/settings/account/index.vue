<script setup lang="ts">
import { birthDateFormat } from '#imports';
import { useUserStore } from '~/stores/user';
import { useI18n } from 'vue-i18n';
import SettingsItem from '~/components/Settings/SettingsItem.vue';
const { locale } = useI18n();
definePageMeta({ layout: 'settings' });
const userStore = useUserStore();
const user = computed(() => userStore.user);
const birthDate = computed(() =>
  user.value?.birthDate ? birthDateFormat(user.value.birthDate, locale.value) : '',
);
</script>

<template>
  <div>
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="flex bg-transparent lg:hidden"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.account-information') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.account-information-details') }}
      </p>
    </div>
    <div v-if="user" class="mt-3 flex flex-col gap-3 overflow-hidden">
      <SettingsItem
        :title="$t('setting.username.username')"
        :subtitle="`@${user.username}`"
        to="/settings/account/username"
        data-cy="username-settings-btn"
      />
      <SettingsItem
        :title="$t('setting.change-email.label')"
        :subtitle="`${user.email}`"
        to="/settings/account/email"
        data-cy="email-settings-btn"
      />
      <SettingsItem
        :title="$t('setting.date-of-birth')"
        :subtitle="birthDate"
        to="/settings/profile"
        data-cy="dob-settings-btn"
      />
      <SettingsItem
        :title="$t('setting.change-password')"
        to="/settings/account/changePasswordEditor"
        subtitle="Change Your Password at any time"
        data-cy="password-settings-btn"
      />
    </div>
    <div v-else class="p-4">
      <p class="text-red-500">{{ $t('setting.failed-to-load-user') }}</p>
    </div>
  </div>
</template>
