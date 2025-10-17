<script lang="ts" setup>
import { Dialog, DialogContent } from '~/components/ui/dialog';
import RegisterationInfoForm from './RegisterationInfoForm.vue';
import Button from '~/components/ui/Button.vue';
import OtpForm from './OtpForm.vue';
import PasswordForm from './PasswordForm.vue';

const registerStore = useRegisterStore();
</script>

<template>
  <Dialog :open="registerStore.open" @update:open="(val: boolean) => (registerStore.open = val)">
    <DialogContent :hide-close-button="registerStore.step !== 0" header-class="ps-0">
      <template #header>
        <Button
          v-if="registerStore.step !== 0"
          variant="ghost-default"
          size="icon-xs"
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
    </DialogContent>
  </Dialog>
</template>
