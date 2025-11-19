<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { storeToRefs } from 'pinia';
import { useLoginStore } from '~/stores/auth/login';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import FieldPassword from '~/components/ui/form/FieldPassword.vue';
import { useI18n } from 'vue-i18n';
import { backendValidationToFormErrors } from '~/utils/errorUtils';

const loginStore = useLoginStore();
const { t } = useI18n();

const { identifier } = storeToRefs(loginStore);

const schema = yup.object({
  password: yup.string().trim().required(t('errors.PASSWORD_REQUIRED')),
});

const { handleSubmit, isSubmitting, meta, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    password: '',
  },
  validateOnMount: false,
});

const onSubmit = handleSubmit(async (values) => {
  const submissionValues = {
    identifier: identifier.value,
    password: values.password.trim(),
  };

  const errors = await loginStore.login(submissionValues);
  if (errors) {
    setErrors(backendValidationToFormErrors(errors, t));
  }
});
</script>

<template>
  <form data-cy="signin-password-form" @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-1 px-8 py-4">
      <UiDialogTitle class="mx-auto w-100 text-start text-3xl font-bold">
        {{ $t('login.password-step.title') }}
      </UiDialogTitle>
    </UiDialogHeader>

    <div class="mx-auto mt-6 w-100">
      <section class="flex flex-col gap-6">
        <FieldInput
          class="input-readonly"
          name="identifier"
          type="text"
          :model-value="identifier"
          :placeholder="
            loginStore.type ? $t(`login.${loginStore.type}`) : $t('login.email-or-username')
          "
          readonly
          data-cy="signin-identifier-input"
        />
        <FieldPassword
          name="password"
          :placeholder="$t('login.password')"
          data-cy="signin-password-input"
        />
      </section>
      <UiButton
        variant="link"
        size="link"
        class="mt-1 text-sm"
        data-testid="forgot-password-link"
        data-cy="signin-forgot-password-link"
        @click="loginStore.openForgotPasswordDialog"
      >
        {{ $t('login.forgot-password') }}
      </UiButton>
    </div>

    <UiDialogFooter class="absolute end-0 bottom-15 w-full">
      <UiButton
        class="mb-1 w-100"
        size="lg"
        type="submit"
        data-testid="submit-button"
        data-cy="signin-next-button"
        :disabled="!meta.valid || isSubmitting"
      >
        {{ $t('login.password-step.signin') }}
      </UiButton>
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
