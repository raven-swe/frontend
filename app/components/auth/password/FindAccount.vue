<script setup lang="ts">
import * as yup from 'yup';
import { nextTick, onMounted } from 'vue';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';
import useRecaptcha from '@/composables/useRecaptcha';

const passwordStore = usePasswordStore();

const schema = yup.object({
  identifier: yup.string().trim().required($t('errors.IDENTIFIER_REQUIRED')),
  recaptcha: yup
    .string()
    .required($t('errors.RECAPTCHA_REQUIRED'))
    .min(1, $t('errors.RECAPTCHA_REQUIRED')),
});

const { defineField, handleSubmit, isSubmitting, meta, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: { identifier: passwordStore.identifier, recaptcha: undefined },
});

const [_identifier, identifierAttrs] = defineField('identifier');
const { render: renderRecaptcha } = useRecaptcha();

const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.checkUserExists({
      identifier: values.identifier.trim(),
      recaptchaToken: values.recaptcha,
    });
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || $t('errors.GENERIC_ERROR'));
  }
});

onMounted(async () => {
  await nextTick();
  renderRecaptcha({
    elementId: 'recaptcha-container',
    callback: (token: string) => {
      setFieldValue('recaptcha', token);
    },
    expiredCallback: () => {
      setFieldValue('recaptcha', '', true);
    },
  });
});
</script>

<template>
  <form data-cy="signin-forgot-pwd-account-form" @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-start text-3xl font-bold">
        {{ $t('forgot-password.find-account.title') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-start text-sm">
        {{ $t('forgot-password.find-account.description') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-7 px-8">
      <section class="flex flex-col gap-4">
        <UiFormFieldInput
          class="mb-4"
          :placeholder="$t('forgot-password.email-or-username')"
          type="text"
          name="identifier"
          :model-value="passwordStore.identifier"
          v-bind="identifierAttrs"
          data-testid="identifier-input"
        />
      </section>

      <ClientOnly class="mt-3">
        <div id="recaptcha-container" class="g-recaptcha"></div>
      </ClientOnly>
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
