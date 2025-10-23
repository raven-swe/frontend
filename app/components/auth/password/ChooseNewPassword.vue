<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';

const passwordStore = usePasswordStore();

const schema = yup.object({
  newPassword: yup.string().trim().min(8, $t('errors.PASSWORD_TOO_SHORT')),
  confirmPassword: yup
    .string()
    .trim()
    .min(8, $t('errors.PASSWORD_TOO_SHORT'))
    .oneOf([yup.ref('newPassword')], $t('errors.PASSWORD_MISMATCH')),
});

const { defineField, handleSubmit, isSubmitting, meta, resetForm } = useForm<
  yup.InferType<typeof schema>
>({
  validationSchema: schema,
  initialValues: { newPassword: '', confirmPassword: '' },
  validateOnMount: false,
  validateOnChange: true,
  validateOnBlur: false,
});

const [_newPassword, newPasswordAttrs] = defineField('newPassword');
const [_confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.resetPassword(values.newPassword.trim());
    resetForm({ values: { newPassword: '', confirmPassword: '' } });
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || $t('errors.GENERIC_ERROR'));
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-3xl font-bold">
        {{ $t('root.auth.choose-new-password') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-sm">
        {{ $t('root.auth.password-strength') }}
      </p>
      <p class="text-muted-foreground mx-auto mt-2 text-sm">
        {{ $t('root.auth.logout-warning') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-2 px-8">
      <section class="flex flex-col gap-6">
        <UiFormFieldPassword
          name="newPassword"
          v-bind="newPasswordAttrs"
          data-testid="new-password-input"
        />
        <UiFormFieldPassword
          :placeholder="$t('root.auth.confirm-password')"
          name="confirmPassword"
          v-bind="confirmPasswordAttrs"
          data-testid="confirm-password-input"
        />
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
        {{ $t('root.auth.change-password') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
