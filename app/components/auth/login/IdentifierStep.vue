<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useLoginStore } from '~/stores/auth/login';
import { showToaster } from '@/utils/showToaster';

const loginStore = useLoginStore();

const schema = yup.object({
  identifier: yup.string().trim().required($t('errors.IDENTIFIER_REQUIRED')),
});

const { defineField, handleSubmit, resetForm, isSubmitting, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    identifier: '',
  },
  validateOnMount: false,
  validateOnChange: true,
  validateOnBlur: false,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const success = await loginStore.checkIdentifierExists(values.identifier.trim());
    if (!success) {
      throw new Error($t('errors.USER_NOT_FOUND'));
    }
    resetForm({ values: { identifier: '' } });
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || $t('errors.GENERIC_ERROR'));
  }
});
const [_identifier, identifierAttrs] = defineField('identifier');
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 px-8 py-4">
      <UiDialogTitle class="mx-auto w-75 text-3xl font-bold">{{
        $t('Sign in to Raven')
      }}</UiDialogTitle>
    </UiDialogHeader>
    <div class="mx-auto mt-7 w-75">
      <section class="flex flex-col gap-4">
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
          data-testid="google-button"
        >
          <Icon name="devicon:google" width="128" height="128"></Icon>
          {{ $t('root.auth.google-signin') }}</UiButton
        >
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
          data-testid="github-button"
        >
          <Icon name="devicon:github" width="128" height="128"></Icon>
          {{ $t('root.auth.github-signin') }}</UiButton
        >
      </section>
      <p class="py-2 text-center">{{ $t('root.auth.separator') }}</p>
      <section class="flex flex-col gap-4">
        <UiFormFieldInput
          :placeholder="$t('root.auth.email-or-username')"
          type="text"
          name="identifier"
          v-bind="identifierAttrs"
          data-testid="identifier-input"
        ></UiFormFieldInput>
      </section>
    </div>
    <UiDialogFooter class="absolute end-0 bottom-15 w-full">
      <UiButton
        class="mb-1 w-75"
        size="lg"
        type="submit"
        data-testid="submit-button"
        :disabled="!meta.valid || isSubmitting"
      >
        {{ $t('ui.next') }}
      </UiButton>
      <UiButton
        class="mb-1 w-75"
        size="lg"
        variant="outline"
        type="button"
        data-testid="forgot-password-button"
        @click="loginStore.openForgotPasswordDialog"
      >
        {{ $t('root.auth.forgot-password') }}
      </UiButton>
      <p class="mt-6">
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
