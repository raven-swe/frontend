<script lang="ts" setup>
import { useLoginStore } from '~/stores/auth/login';

const loginStore = useLoginStore();

const handleDialogChange = (val: boolean) => {
  loginStore.open = val;
  if (!val) {
    loginStore.closeDialog();
  }
};
</script>

<template>
  <UiDialog :open="loginStore.open" @update:open="handleDialogChange">
    <UiDialogContent class="pt-2">
      <AuthLoginIdentifierStep v-if="loginStore.step === 0" />
      <AuthLoginPasswordStep v-if="loginStore.step === 1" />
    </UiDialogContent>
  </UiDialog>
</template>
