<script lang="ts" setup>
import { usePasswordStore } from '@/stores/auth/password';
import { onMounted } from 'vue';
import FindAccount from '@/components/auth/password/FindAccount.vue';
import SentCode from '@/components/auth/password/SentCode.vue';
import ChooseNewPassword from '~/components/auth/password/ChooseNewPassword.vue';
definePageMeta({
  layout: false,
});

const passwordStore = usePasswordStore();
onMounted(() => {
  passwordStore.openDialog();
});
</script>

<template>
  <div class="bg-background">
    <UiDialog :open="passwordStore.open" :modal="false">
      <div
        v-if="passwordStore.open"
        :data-state="passwordStore.open ? 'open' : 'closed'"
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-dialog-backdrop fixed inset-0 z-50"
      />
      <UiDialogContent :hide-close-button="true" header-class="ps-0">
        <template #header>
          <UiButton
            variant="ghost-default"
            size="icon-xs"
            class="absolute ms-2"
            @click="passwordStore.closeDialog"
          >
            <Icon name="lucide:x" class="size-5" />
            <span class="sr-only">{{ $t('ui.close') }}</span>
          </UiButton>
        </template>
        <UiSpinner v-if="passwordStore.loading" class="mx-auto my-auto"></UiSpinner>
        <FindAccount
          v-if="passwordStore.step === 0"
          v-show="!passwordStore.loading"
          id="identifier-step-test"
        />
        <SentCode
          v-if="passwordStore.step === 1"
          v-show="!passwordStore.loading"
          id="password-step-test"
        />
        <ChooseNewPassword
          v-if="passwordStore.step === 2"
          v-show="!passwordStore.loading"
          id="new-password-step-test"
        />
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
