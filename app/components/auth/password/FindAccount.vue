<script setup lang="ts">
import * as yup from 'yup';
import { nextTick, onMounted } from 'vue';
import { useForm } from 'vee-validate';
import { usePasswordStore } from '~/stores/auth/password';
import useRecaptcha from '@/composables/useRecaptcha';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { useI18n } from 'vue-i18n';
import { backendValidationToFormErrors } from '~/utils/errorUtils';
import type { CheckUserSchema } from '~/services/auth/passwordService';

const passwordStore = usePasswordStore();
const { t } = useI18n();

const schema = yup.object({
  identifier: yup.string().trim().required(t('errors.IDENTIFIER_REQUIRED')),
  recaptchaToken: yup
    .string()
    .required(t('errors.RECAPTCHA_REQUIRED'))
    .min(1, t('errors.RECAPTCHA_REQUIRED')),
});

const { errors, defineField, handleSubmit, isSubmitting, meta, setFieldValue, setFieldError } =
  useForm({
    validationSchema: schema,
    initialValues: { identifier: passwordStore.identifier, recaptchaToken: '' },
    validateOnMount: false,
  });

const [_identifier, identifierAttrs] = defineField('identifier');
const { render: renderRecaptcha, reset: resetRecaptcha } = useRecaptcha();

const onSubmit = handleSubmit(async (values, actions) => {
  const vals: CheckUserSchema = {
    identifier: values.identifier.trim(),
    recaptchaToken: values.recaptchaToken,
  };
  const errors = await passwordStore.checkUserExists(vals);
  if (errors) {
    actions.setErrors(backendValidationToFormErrors(errors, t));
    resetRecaptcha(undefined);
  }
});

onMounted(async () => {
  await nextTick();
  renderRecaptcha({
    elementId: 'recaptcha-container',
    callback: (token: string) => {
      setFieldValue('recaptchaToken', token);
      setFieldError('recaptchaToken', undefined);
    },
    expiredCallback: () => {
      setFieldValue('recaptchaToken', '', true);
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
        <FieldInput
          :placeholder="$t('forgot-password.email-or-username')"
          type="text"
          name="identifier"
          :model-value="passwordStore.identifier"
          v-bind="identifierAttrs"
          data-testid="identifier-input"
        />
      </section>

      <ClientOnly class="mt-10">
        <div>
          <div id="recaptcha-container" class="g-recaptcha"></div>
          <p v-if="errors.recaptchaToken" class="text-destructive text-xs">
            {{ errors.recaptchaToken }}
          </p>
        </div>
      </ClientOnly>
    </div>

    <UiDialogFooter class="absolute end-0 bottom-8 w-full">
      <UiButton
        class="w-100"
        size="xl"
        type="submit"
        :disabled="!meta.valid || isSubmitting"
        data-testid="submit-button"
      >
        {{ $t('ui.next') }}
      </UiButton>
    </UiDialogFooter>
  </form>
</template>
