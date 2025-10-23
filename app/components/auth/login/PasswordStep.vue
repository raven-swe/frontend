<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { storeToRefs } from 'pinia';
import { useLoginStore } from '~/stores/auth/login';
import { showToaster } from '@/utils/showToaster';

const loginStore = useLoginStore();
const { identifier } = storeToRefs(loginStore);

const schema = yup.object({
  password: yup.string().trim().required($t('errors.PASSWORD_REQUIRED')),
});

const { defineField, handleSubmit, resetForm, isSubmitting, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    password: '',
  },
  validateOnMount: false,
  validateOnChange: true,
  validateOnBlur: false,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const submissionValues = {
      identifier: identifier.value,
      password: values.password.trim(),
    };
    await loginStore.submitLogin(submissionValues);
    resetForm({ values: { password: '' } });
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || $t('errors.GENERIC_ERROR'));
  }
});

const [_password, passwordAttrs] = defineField('password');
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 px-8 py-4">
      <UiDialogTitle class="mx-auto w-100 text-3xl font-bold">
        {{ $t('Enter your password') }}
      </UiDialogTitle>
    </UiDialogHeader>

    <div class="mx-auto mt-6 w-100">
      <section class="flex flex-col gap-6">
        <UiFormFieldInput
          class="input-readonly"
          name="identifier"
          type="text"
          :model-value="identifier"
          :placeholder="
            loginStore.type ? $t(`root.auth.${loginStore.type}`) : $t('root.auth.email-or-username')
          "
          readonly
        />
        <UiFormFieldPassword name="password" v-bind="passwordAttrs" />
      </section>
      <p
        class="text-primary ms-1 mt-2 block w-fit cursor-pointer text-sm hover:underline"
        data-testid="forgot-password-link"
        @click="loginStore.openForgotPasswordDialog"
      >
        {{ $t('root.auth.forgot-password') }}
      </p>
    </div>

    <UiDialogFooter class="absolute end-0 bottom-15 w-full">
      <UiButton
        class="mb-1 w-100"
        size="lg"
        type="submit"
        data-testid="submit-button"
        :disabled="!meta.valid || isSubmitting"
      >
        {{ $t('root.auth.signin') }}
      </UiButton>
      <p class="mt-4 w-fit">
        {{ $t('root.auth.dont-have-account') }}
        <NuxtLink to="/auth/signup" class="text-primary" data-testid="signup-link">
          {{ $t('root.auth.signup') }}
        </NuxtLink>
      </p>
    </UiDialogFooter>
  </form>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
