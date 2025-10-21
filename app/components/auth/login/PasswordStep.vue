<script setup lang="ts">
import { ref } from 'vue';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { storeToRefs } from 'pinia';
import { useLoginStore } from '~/stores/auth/login';

const loginStore = useLoginStore();
const { identifier } = storeToRefs(loginStore);
const loading = ref(false);
const error = ref('');

const schema = yup.object({
  password: yup.string(),
});

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    password: '',
  },
  validateOnMount: true,
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  error.value = '';

  try {
    if (!values.password || values.password.trim() === '') {
      throw new Error($t('errors.PASSWORD_REQUIRED'));
    }

    const submissionValues = {
      identifier: identifier.value,
      password: values.password,
    };

    await loginStore.submitLogin(submissionValues);

    resetForm({ values: { password: '' } });
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message || $t('errors.GENERIC_ERROR');
    } else {
      error.value = $t('errors.GENERIC_ERROR');
    }
    console.error('Login error:', error.value);
  } finally {
    loading.value = false;
  }
});

const [_password, passwordAttrs] = defineField('password');
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader v-if="!loading" class="mt-3 px-8 py-4">
      <UiDialogTitle class="mx-auto w-100 text-3xl font-bold">
        {{ $t('Enter your password') }}
      </UiDialogTitle>
    </UiDialogHeader>

    <div v-if="!loading" class="mx-auto mt-6 w-100">
      <UiFormFieldInput
        class="input-readonly mb-7"
        name="identifier"
        type="text"
        :model-value="identifier"
        placeholder="email or username"
        readonly
      />
      <UiFormFieldPassword name="password" v-bind="passwordAttrs" />
      <p class="text-primary ms-1 mt-1 block text-sm">
        <NuxtLink to="/auth/forgot-password">
          {{ $t('root.auth.forget-password') }}
        </NuxtLink>
      </p>
    </div>

    <UiDialogFooter v-if="!loading" class="mt-40">
      <UiButton class="mb-1 w-100" size="lg" type="submit">
        {{ $t('root.auth.signin') }}
      </UiButton>
      <p class="mt-4 w-fit">
        {{ $t('root.auth.dont-have-account') }}
        <NuxtLink to="/auth/signup" class="text-primary">
          {{ $t('root.auth.signup') }}
        </NuxtLink>
      </p>
      <Transition name="fade"
        ><p v-if="error" class="mt-3 text-red-500">{{ error }}</p></Transition
      >
    </UiDialogFooter>
    <UiSpinner v-if="loading" class="mx-auto my-auto"></UiSpinner>
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
