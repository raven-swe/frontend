<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useLoginStore } from '~/stores/auth/login';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { useI18n } from 'vue-i18n';
import { backendValidationToFormErrors } from '~/utils/errorUtils';
import { useOAuthHandlers } from '~/composables/useOAuthHandlers';

const loginStore = useLoginStore();
const { handleGithubSignIn, handleGoogleSignIn, setupOAuthMessageListener } = useOAuthHandlers();

onMounted(() => {
  setupOAuthMessageListener();
});
const { t } = useI18n();

const schema = yup.object({
  identifier: yup.string().trim().required(t('errors.IDENTIFIER_REQUIRED')),
});

const { handleSubmit, isSubmitting, meta, setErrors } = useForm<yup.InferType<typeof schema>>({
  validationSchema: schema,
  initialValues: {
    identifier: loginStore.identifier,
  },
  validateOnMount: false,
});

const onSubmit = handleSubmit(async (values, actions) => {
  const res = await loginStore.checkUserExists(values.identifier.trim());
  if (res === undefined) return;
  else if (typeof res === 'object') {
    actions.setErrors(backendValidationToFormErrors(res, t));
  } else if (res === false) {
    setErrors({ identifier: t('errors.USER_NOT_FOUND') });
  }
});
</script>

<template>
  <form data-cy="signin-email-form" @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-1 px-8 py-4">
      <UiDialogTitle class="mx-auto w-75 text-start text-3xl font-bold">{{
        $t('login.identifier-step.title')
      }}</UiDialogTitle>
    </UiDialogHeader>
    <div class="mx-auto mt-5 w-75">
      <section class="flex flex-col gap-4">
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
          data-testid="google-button"
          data-cy="signin-google-button"
          @click="handleGoogleSignIn"
        >
          <Icon name="devicon:google" width="128" height="128"></Icon>
          {{ $t('login.identifier-step.google-signin') }}</UiButton
        >
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
          data-testid="github-button"
          data-cy="signin-github-button"
          @click="handleGithubSignIn"
        >
          <Icon name="devicon:github" width="128" height="128"></Icon>
          {{ $t('login.identifier-step.github-signin') }}</UiButton
        >
      </section>
      <p class="py-2 text-center">{{ $t('root.auth.separator') }}</p>
      <section class="flex flex-col gap-4">
        <FieldInput
          :placeholder="$t('login.email-or-username')"
          type="text"
          name="identifier"
          data-testid="identifier-input"
          data-cy="signin-identifier-input"
        />
      </section>
    </div>
    <UiDialogFooter class="absolute end-0 bottom-15 w-full">
      <UiButton
        class="mb-1 w-75"
        size="lg"
        type="submit"
        data-testid="submit-button"
        data-cy="signin-next-button"
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
        data-cy="signin-forgot-password-link"
        @click="loginStore.openForgotPasswordDialog"
      >
        {{ $t('login.forgot-password') }}
      </UiButton>
      <p class="mt-6">
        {{ $t('login.dont-have-account') }}
        <UiButton
          variant="link"
          size="link"
          type="button"
          data-testid="signup-link"
          data-cy="signin-signup-link"
          @click="loginStore.openSignupDialog"
        >
          {{ $t('login.signup') }}
        </UiButton>
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
