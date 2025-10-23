<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';

const passwordStore = usePasswordStore();

const schema = yup.object({
  otp: yup.string().trim().min(3),
});

const { defineField, handleSubmit, isSubmitting, meta, resetForm } = useForm<
  yup.InferType<typeof schema>
>({
  validationSchema: schema,
  initialValues: { otp: '' },
  validateOnMount: false, // ✅ don’t validate on load
  validateOnChange: true, // ✅ validate as user types
  validateOnBlur: false, // optional
});

const [_otp, otpAttrs] = defineField('otp');

const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.verifyUser(values.otp.trim());
    resetForm({ values: { otp: '' } });
  } catch (err: unknown) {
    showToaster('error', (err as Error)?.message || $t('errors.GENERIC_ERROR'));
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-3xl font-bold">
        {{ $t('root.auth.we-sent-code') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-sm">
        {{ $t('root.auth.enter-otp') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-7 px-8">
      <section class="flex flex-col">
        <UiFormFieldInput
          :placeholder="$t('root.auth.enter-your-code')"
          type="text"
          name="otp"
          v-bind="otpAttrs"
          data-testid="otp-input"
        />
        <UiButton
          variant="link-secondary"
          size="xs"
          class="mt-0 w-fit px-0"
          type="button"
          :disabled="isSubmitting"
          @click.prevent="passwordStore.resendOtp()"
        >
          {{ $t('root.auth.resend-code') }}
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
      >
        {{ $t('ui.next') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
