<script lang="ts" setup>
import RegisterationInfoForm from './RegisterationInfoForm.vue';
import Button from '~/components/ui/Button.vue';
import OtpForm from './OtpForm.vue';
import PasswordForm from './PasswordForm.vue';

const registerStore = useRegisterStore();

function handleOpenChange(val: boolean) {
  if (!val) registerStore.resetInitialData();
  registerStore.open = val;
}
</script>

<template>
  <UiDialog :open="registerStore.open" :modal="false" @update:open="handleOpenChange">
    <div
      v-if="registerStore.open"
      :data-state="registerStore.open ? 'open' : 'closed'"
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-dialog-backdrop fixed inset-0 z-50"
    />
    <UiDialogContent :hide-close-button="registerStore.step !== 0" header-class="ps-0">
      <template #header>
        <Button
          v-if="registerStore.step !== 0"
          variant="ghost-default"
          size="icon-xs"
          data-test-id="back-button"
          @click="registerStore.previousStep"
        >
          <Icon name="lucide:arrow-left" />
        </Button>
      </template>
      <div class="flex flex-1 flex-col px-12">
        <RegisterationInfoForm v-if="registerStore.step === 0" />
        <OtpForm v-if="registerStore.step === 1" />
        <PasswordForm v-if="registerStore.step === 2" />
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
