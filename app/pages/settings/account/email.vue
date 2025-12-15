<script lang="ts" setup>
import { useChangeEmailStore } from '~/stores/settings/change-email';
import ChangeEmailForm from '~/components/emailSettings/ChangeEmailForm.vue';
import OtpForm from '~/components/emailSettings/OtpForm.vue';
definePageMeta({ layout: 'settings' });

const userStore = useUserStore();
const changeEmailStore = useChangeEmailStore();
const router = useRouter();
</script>

<template>
  <div class="flex flex-col gap-3 overflow-hidden">
    <ChangeEmailForm />
    <OtpForm />
    <div class="mb-4 flex items-center gap-4 p-4">
      <Icon
        :name="$t('setting.back-button-icon')"
        size="1.5rem"
        class="cursor-pointer"
        @click="router.back()"
      />
      <h1 class="text-2xl font-bold">{{ $t('setting.change-email.title') }}</h1>
    </div>
    <div class="flex flex-col gap-6 px-4">
      <UiInput
        placeholder="Email"
        :model-value="userStore.user?.email"
        data-cy="email-settings-input"
        disabled
      />
      <UiButton
        data-cy="email-settings-change-btn"
        @click="() => changeEmailStore.handleDialogChange(true)"
      >
        {{ $t('setting.change-email.title') }}
      </UiButton>
    </div>
  </div>
</template>
