<script setup lang="ts">
import { useRouter } from 'vue-router';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { apiFetch } from '~/api';
definePageMeta({
  layout: 'settings',
});
const router = useRouter();

const schema = yup.object({
  currentPassword: yup
    .string()
    .required($t('setting.password.errors.current-password-required'))
    .min(1, $t('setting.password.errors.current-password-required')),
  newPassword: yup
    .string()
    .required($t('setting.password.errors.new-password-required'))
    .min(10, $t('setting.password.errors.password-invalid'))
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/,
      $t('setting.password.errors.password-invalid'),
    ),
  confirmPassword: yup
    .string()
    .required($t('setting.password.errors.confirm-password-required'))
    .oneOf([yup.ref('newPassword')], $t('setting.password.errors.passwords-do-not-match')),
});

const { errors, defineField, handleSubmit, isSubmitting, setFieldError } = useForm<
  yup.InferType<typeof schema>
>({
  validationSchema: schema,
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
});

const [_currentPassword, currentPasswordAttrs] = defineField('currentPassword');
const [_newPassword, newPasswordAttrs] = defineField('newPassword');
const [_confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  try {
    await apiFetch('/api/settings/password', {
      method: 'PUT' as const,
      query: { currentPassword: values.currentPassword, newPassword: values.newPassword },
    });

    router.push('/settings/account');
  } catch (error: unknown) {
    console.error('Error saving password:', error);

    // Handle different error status codes
    const err = error as { statusCode?: number; status?: number };
    const statusCode = err?.statusCode || err?.status;
    const errorKey = statusCode
      ? `setting.password.errors.${statusCode}`
      : 'setting.password.errors.error-saving';

    setFieldError('currentPassword', $t(errorKey) || $t('setting.password.errors.error-saving'));
  }
});
</script>

<template>
  <form class="flex min-h-screen flex-col" @submit.prevent="onSubmit">
    <div class="mb-4 flex items-center gap-4 p-4">
      <Icon
        :name="$t('setting.back-button-icon')"
        size="1.5rem"
        class="cursor-pointer"
        to="/playground/settings"
        @click="router.push('/settings/account')"
      />
      <h1 class="text-2xl font-bold">{{ $t('setting.password.change-password') }}</h1>
    </div>

    <div class="flex flex-1 flex-col">
      <div class="border-border border-b px-4 pb-8">
        <div>
          <FieldInput
            type="password"
            name="currentPassword"
            :placeholder="$t('setting.password.current-password')"
            v-bind="currentPasswordAttrs"
          />
          <NuxtLink
            to="/password-reset"
            class="text-primary mt-2 inline-block text-sm hover:underline"
          >
            {{ $t('setting.password.forgot-password') }}
          </NuxtLink>
        </div>
      </div>

      <div class="border-border border-b px-4 py-8">
        <FieldInput
          type="password"
          name="newPassword"
          :placeholder="$t('setting.password.new-password')"
          v-bind="newPasswordAttrs"
        />
      </div>

      <div class="border-border border-b px-4 py-8">
        <FieldInput
          type="password"
          name="confirmPassword"
          :placeholder="$t('setting.password.confirm-password')"
          v-bind="confirmPasswordAttrs"
        />
      </div>

      <div class="flex justify-end px-4 py-8">
        <Button
          type="submit"
          :disabled="Object.entries(errors).length > 0 || isSubmitting"
          variant="primary"
          size="md"
          class="w-fit"
        >
          {{ $t('setting.password.save') }}
        </Button>
      </div>
    </div>
  </form>
</template>
