<script lang="ts" setup>
import { useLoginStore } from '~/stores/auth/login';

const loginStore = useLoginStore();

const handleDialogChange = (val: boolean) => {
  if (!val) loginStore.closeDialog();
  loginStore.open = val;
};
</script>

<template>
  <UiDialog :open="loginStore.open" @update:open="handleDialogChange">
    <UiDialogContent class="pt-2">
      <UiSpinner v-if="loginStore.loading" class="mx-auto my-auto"></UiSpinner>
      <AuthLoginIdentifierStep
        v-if="loginStore.step === 0 && !loginStore.loading"
        id="identifier-step-test"
      />
      <AuthLoginPasswordStep
        v-if="loginStore.step === 1 && !loginStore.loading"
        id="password-step-test"
      />
    </UiDialogContent>
  </UiDialog>
</template>
