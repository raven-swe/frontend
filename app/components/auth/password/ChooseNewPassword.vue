<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';
import { createPasswordSchema } from '~/schemas/auth';

const passwordStore = usePasswordStore();
const { t } = useI18n();

const schema = yup.object({
  newPassword: createPasswordSchema(t),
  confirmPassword: createPasswordSchema(t).oneOf(
    [yup.ref('newPassword')],
    t('errors.PASSWORD_MISMATCH'),
  ),
});

const { defineField, handleSubmit, isSubmitting, meta } = useForm({
  validationSchema: schema,
  initialValues: { newPassword: '', confirmPassword: '' },
  validateOnMount: false,
});

const [_newPassword, newPasswordAttrs] = defineField('newPassword');
const [_confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.resetPassword(values.newPassword.trim());
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || t('errors.GENERIC_ERROR'));
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-start text-3xl font-bold">
        {{ $t('forgot-password.new-password.title') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-start text-sm">
        {{ $t('forgot-password.new-password.description') }}
      </p>
      <p class="text-muted-foreground mx-auto mt-2 text-start text-sm">
        {{ $t('forgot-password.new-password.warning') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-2 px-8">
      <section class="flex flex-col gap-6">
        <UiFormFieldPassword
          :placeholder="$t('forgot-password.new-password.password.label')"
          name="newPassword"
          v-bind="newPasswordAttrs"
          data-testid="new-password-input"
        />
        <UiFormFieldPassword
          :placeholder="$t('forgot-password.new-password.confirm-password.label')"
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
        {{ $t('forgot-password.new-password.change-password-button') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
