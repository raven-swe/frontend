<script lang="ts" setup>
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { createOtpSchema } from '~/schemas/auth';
import { useChangeEmailStore } from '~/stores/settings/change-email';

const changeEmailStore = useChangeEmailStore();
const { t } = useI18n();

const { errors, defineField, handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: createOtpSchema(t),
  initialValues: {
    otp: '',
  },
});
const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
  const success = await changeEmailStore.handleOtpSubmit(values.otp);

  router.push('/settings/account');
  if (!success) {
    setErrors({ otp: t('errors.INVALID_OTP') });
  } else {
    setErrors({ otp: undefined });
  }
});

const [_otp, otpAttrs] = defineField('otp');
</script>

<template>
  <UiDialog
    :open="changeEmailStore.isOpen && changeEmailStore.step === 'otp'"
    @update:open="changeEmailStore.handleDialogChange"
  >
    <UiDialogContent>
      <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
        <UiDialogHeader class="py-6">
          <UiDialogTitle class="text-4xl font-bold">{{ $t('register.otp.title') }}</UiDialogTitle>
          <UiDialogDescription>
            {{
              $t('register.otp.description', {
                email: changeEmailStore.email,
              })
            }}
          </UiDialogDescription>
        </UiDialogHeader>
        <div class="flex flex-col gap-2">
          <FieldInput
            :placeholder="$t('register.otp.label')"
            inputmode="numeric"
            type="text"
            pattern="[0-9]*"
            name="otp"
            v-bind="otpAttrs"
          />
          <Button
            type="button"
            variant="link"
            size="link"
            class="w-fit"
            @click="changeEmailStore.handleResendOtp"
          >
            {{ $t('register.otp.resend-code') }}
          </Button>
        </div>
        <UiDialogFooter class="mt-auto">
          <Button
            type="submit"
            :disabled="Object.entries(errors).length > 0 || isSubmitting"
            size="xl"
            class="w-full"
            >{{ $t('ui.next') }}</Button
          >
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
