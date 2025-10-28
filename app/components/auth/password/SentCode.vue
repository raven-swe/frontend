<script setup lang="ts">
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';
import { createOtpSchema } from '~/schemas/auth';

const passwordStore = usePasswordStore();
const { t } = useI18n();

const { defineField, handleSubmit, isSubmitting, meta } = useForm({
  validationSchema: createOtpSchema(t),
  initialValues: { otp: '' },
  validateOnMount: false,
});

const [_otp, otpAttrs] = defineField('otp');

const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.verifyUser(values.otp.trim());
  } catch (err: unknown) {
    showToaster('error', (err as Error)?.message || t('errors.GENERIC_ERROR'));
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit">
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
        <UiFormFieldInput
          :placeholder="$t('forgot-password.otp.label')"
          type="text"
          name="otp"
          v-bind="otpAttrs"
          data-testid="otp-input"
        />
        <p
          class="text-primary ms-1 mt-2 block w-fit cursor-pointer text-sm"
          data-testid="resend-link"
          @click.prevent="passwordStore.resendOtp()"
        >
          {{ $t('forgot-password.otp.resend-code') }}
        </p>
      </section>
    </div>

    <UiDialogFooter class="absolute end-0 bottom-8 w-full">
      <UiButton
        class="w-100"
        size="xl"
        type="submit"
        data-testid="submit-button"
        :disabled="!meta.valid || isSubmitting"
      >
        {{ $t('ui.next') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
