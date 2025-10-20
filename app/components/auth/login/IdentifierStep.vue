<script setup lang="ts">
import { ref } from 'vue';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useLoginStore } from '~/stores/auth/login';

const loginStore = useLoginStore();
const loading = ref(false);
const error = ref('');

const schema = yup.object({
  identifier: yup.string(),
});

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    identifier: '',
  },
  validateOnMount: true,
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  error.value = '';

  try {
    if (!values.identifier || values.identifier.trim() === '') {
      throw new Error($t('errors.IDENTIFIER_REQUIRED'));
    }
    const success = await loginStore.checkIdentifierExists(values.identifier);
    if (!success) throw new Error($t('errors.USER_NOT_FOUND'));
    resetForm({ values: { identifier: '' } });
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message || $t('errors.GENERIC_ERROR');
    } else {
      error.value = $t('errors.GENERIC_ERROR');
    }
    console.error('Identifier check error:', error.value);
  } finally {
    loading.value = false;
  }
});
const [_identifier, identifierAttrs] = defineField('identifier');
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader v-if="!loading" class="mt-3 px-8 py-4">
      <UiDialogTitle class="mx-auto w-75 text-3xl font-bold">{{
        $t('Sign in to Raven')
      }}</UiDialogTitle>
    </UiDialogHeader>
    <div v-if="!loading" class="mx-auto mt-7 w-75">
      <section class="flex flex-col gap-4">
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
        >
          <Icon name="devicon:google" width="128" height="128"></Icon>
          {{ $t('root.auth.google-signin') }}</UiButton
        >
        <UiButton
          class="bg-oauth dark:hover:bg-oauth/80 hover:bg-oauth/110 border-foreground mb-1 border text-black"
          type="button"
          size="lg"
        >
          <Icon name="devicon:github" width="128" height="128"></Icon>
          {{ $t('root.auth.github-signin') }}</UiButton
        >
      </section>
      <p class="py-2 text-center">{{ $t('root.auth.separator') }}</p>
      <section class="flex flex-col gap-4">
        <UiFormFieldInput
          class="mb-4"
          placeholder="email or username"
          type="text"
          name="identifier"
          v-bind="identifierAttrs"
        ></UiFormFieldInput>
      </section>
    </div>
    <UiDialogFooter v-if="!loading">
      <UiButton class="mb-1 w-75" size="lg" type="submit"> {{ $t('ui.next') }} </UiButton>
      <UiButton class="mb-1 w-75" size="lg" variant="outline" type="button">
        {{ $t('root.auth.forget-password') }}
      </UiButton>
      <p class="mt-6">
        {{ $t('root.auth.dont-have-account') }}
        <NuxtLink to="/auth/signup" class="text-primary"> {{ $t('root.auth.signup') }} </NuxtLink>
      </p>
      <Transition name="fade"
        ><p v-if="error" class="mt-3 text-red-500">{{ error }}</p></Transition
      >
    </UiDialogFooter>
  </form>
  <span v-if="loading" class="my-auto text-center">{{ 'loading...' }}</span>
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
