<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import { showToaster } from '@/utils/showToaster';

const passwordStore = usePasswordStore();

const schema = yup.object({
  identifier: yup.string().trim().min(1),
});

const { defineField, handleSubmit, isSubmitting, meta, resetForm } = useForm<
  yup.InferType<typeof schema>
>({
  validationSchema: schema,
  initialValues: { identifier: passwordStore.identifier },
  validateOnMount: false,
  validateOnChange: true,
  validateOnBlur: false,
});

const [_identifier, identifierAttrs] = defineField('identifier');
const onSubmit = handleSubmit(async (values) => {
  try {
    await passwordStore.checkUserExists({
      identifier: values.identifier.trim(),
      recaptchaToken: 'recaptchaToken',
    });
    resetForm({ values: { identifier: '' } });
  } catch (err: unknown) {
    showToaster('error', (err as Error).message || $t('errors.GENERIC_ERROR'));
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UiDialogHeader class="mt-3 w-fit px-8 py-4">
      <UiDialogTitle class="text-3xl font-bold">
        {{ $t('root.auth.find-your-account') }}
      </UiDialogTitle>
      <p class="text-muted-foreground mx-auto mt-2 text-sm">
        {{ $t('root.auth.enter-identifier') }}
      </p>
    </UiDialogHeader>

    <div class="mx-auto mt-7 px-8">
      <section class="flex flex-col gap-4">
        <UiFormFieldInput
          class="mb-4"
          :placeholder="$t('root.auth.email-or-username')"
          type="text"
          name="identifier"
          :model-value="passwordStore.identifier"
          v-bind="identifierAttrs"
          data-testid="identifier-input"
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
        {{ $t('ui.next') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
