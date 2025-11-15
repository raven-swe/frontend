<script lang="ts" setup>
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { createOtpSchema } from '~/schemas/auth';

const registerStore = useRegisterStore();
const { t } = useI18n();

const { errors, defineField, handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: createOtpSchema(t),
  initialValues: {
    otp: '',
  },
});

const onSubmit = handleSubmit(async (values) => {
  const validationErrors = await registerStore.submitOtp(values.otp);
  if (validationErrors) {
    setErrors(backendValidationToFormErrors(validationErrors, t));
  }
});

const [_otp, otpAttrs] = defineField('otp');

const retryOtpTimeout = ref<number | null>(null);

const onResendOtp = async () => {
  const retryAfter = await registerStore.resendOtp();
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
  <form
    class="flex h-full flex-col justify-between"
    data-cy="signup-otp-form"
    @submit.prevent="onSubmit"
  >
    <UiDialogHeader class="py-6">
      <UiDialogTitle class="text-4xl font-bold">{{ $t('register.otp.title') }}</UiDialogTitle>
      <UiDialogDescription>
        {{
          $t('register.otp.description', {
            email: registerStore.registerationInfo?.email,
          })
        }}
      </UiDialogDescription>
    </UiDialogHeader>
    <div class="flex flex-col gap-2">
      <FieldInput
        :placeholder="$t('register.otp.label')"
        inputmode="numeric"
        type="text"
        data-cy="signup-otp"
        pattern="[0-9]*"
        name="otp"
        v-bind="otpAttrs"
      />
      <Button
        type="button"
        data-cy="signup-resend-otp-button"
        variant="link"
        size="link"
        class="w-fit"
        :disabled="retryOtpTimeout !== null && retryOtpTimeout > 0"
        @click="onResendOtp"
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
        data-cy="signup-next-button"
        >{{ $t('ui.next') }}</Button
      >
    </UiDialogFooter>
  </form>
</template>
