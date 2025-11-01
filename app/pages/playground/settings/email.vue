<script lang="ts" setup>
import { useChangeEmailStore } from '~/stores/settings/change-email';
import ChangeEmailForm from './ChangeEmailForm.vue';
import OtpForm from './OtpForm.vue';

const userStore = useUserStore();
const changeEmailStore = useChangeEmailStore();
</script>

<template>
  <div class="flex flex-col gap-3 overflow-hidden">
    <ChangeEmailForm />
    <OtpForm />
    <div class="mb-4 flex items-center gap-4 p-4">
      <NuxtLink
        to="/playground/settings"
        class="hover:bg-foreground/10 flex size-8 items-center justify-center rounded-full"
      >
        <Icon
          :name="$t('setting.back-button-icon')"
          size="1.5rem"
          class="aspect-square cursor-pointer"
        />
      </NuxtLink>
      <h1 class="text-2xl font-bold">{{ $t('setting.change-email.title') }}</h1>
    </div>
    <div class="flex flex-col gap-6 px-4">
      <UiInput placeholder="Email" :model-value="userStore.user.email" disabled />
      <UiButton @click="() => changeEmailStore.handleDialogChange(true)">
        {{ $t('setting.change-email.title') }}
      </UiButton>
    </div>
  </div>
</template>
