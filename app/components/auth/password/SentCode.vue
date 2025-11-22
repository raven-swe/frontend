<script setup lang="ts">
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { backendValidationToFormErrors } from '~/utils/errorUtils';
import { createOtpSchema } from '~/schemas/auth';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { useI18n } from 'vue-i18n';

const passwordStore = usePasswordStore();
const { t } = useI18n();

const { defineField, handleSubmit, isSubmitting, meta, setErrors } = useForm({
  validationSchema: createOtpSchema(t),
  initialValues: { otp: '' },
  validateOnMount: false,
});

const [_otp, otpAttrs] = defineField('otp');

const onSubmit = handleSubmit(async (values, actions) => {
  const errors = await passwordStore.verifyUser(values.otp.trim());
  if (errors) {
    actions.setErrors(backendValidationToFormErrors(errors, t));
  }
});

const retryOtpTimeout = ref<number | null>(null);

const onResendOtp = async () => {
  const retryAfter = await passwordStore.resendOtp();
  if (!retryAfter) return;
  retryOtpTimeout.value = retryAfter;
  setErrors({ otp: t('errors.OTP_RESEND_LIMIT_EXCEEDED', { seconds: retryAfter }) });
  startCountdown();
};

let countdownInterval: ReturnType<typeof setInterval> | null = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (retryOtpTimeout.value && retryOtpTimeout.value > 0) {
      retryOtpTimeout.value -= 1;
      if (retryOtpTimeout.value > 0)
        setErrors({
          otp: t('errors.OTP_RESEND_LIMIT_EXCEEDED', { seconds: retryOtpTimeout.value }),
        });
      if (retryOtpTimeout.value === 0) {
        setErrors({ otp: undefined });
      }
    } else {
      if (countdownInterval) clearInterval(countdownInterval);
      setErrors({ otp: undefined });
      countdownInterval = null;
    }
  }, 1000);
};
</script>

<template>
  <form data-cy="forgot-pwd-otp-form" @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-start text-3xl font-bold">
        {{ $t('forgot-password.otp.title') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-start text-sm">
        {{ $t('forgot-password.otp.description') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-7 px-8">
      <section class="flex flex-col">
        <FieldInput
          :placeholder="$t('forgot-password.otp.label')"
          inputmode="numeric"
          type="text"
          name="otp"
          v-bind="otpAttrs"
          data-testid="otp-input"
          data-cy="forgot-pwd-otp-input"
        />
        <UiButton
          class="ms-1 mt-2 block w-fit"
          type="button"
          variant="link"
          size="link"
          data-testid="resend-link"
          :disabled="retryOtpTimeout !== null && retryOtpTimeout > 0"
          @click="onResendOtp"
        >
          {{ $t('forgot-password.otp.resend-code') }}
        </UiButton>
      </section>
    </div>

    <UiDialogFooter class="absolute end-0 bottom-8 w-full">
      <UiButton
        class="w-100"
        size="xl"
        type="submit"
        data-testid="submit-button"
        :disabled="!meta.valid || isSubmitting"
        data-cy="forgot-pwd-next-button"
      >
        {{ $t('ui.next') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
