<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';
import { useChangeEmailStore } from '~/stores/settings/change-email';
import { registerationService } from '~/services/auth/registerationService';

const changeEmailStore = useChangeEmailStore();
const userStore = useUserStore();

const schema = yup.object({
  email: yup.string().min(1, $t('errors.INVALID_EMAIL')).email($t('errors.INVALID_EMAIL')),
});
const { errors, values, defineField, handleSubmit, isSubmitting, setFieldError } = useForm<
  yup.InferType<typeof schema>
>({
  validationSchema: schema,
  initialValues: {
    email: '',
  },
});

const onSubmit = handleSubmit(async (values) => {
  if (!values.email) return;
  await changeEmailStore.handleEmailSubmit(values.email);
});

const [_email, emailAttrs] = defineField('email');

const emailExists = ref(false);

const checkEmail = useDebounceFn(async (email: string) => {
  return await registerationService.checkEmail(email);
}, 300);
watch(
  () => values.email,
  async (email) => {
    if (!email) return;
    const exists = await checkEmail(email);
    emailExists.value = exists;
    if (exists) setFieldError('email', $t('errors.EMAIL_ALREADY_EXISTS'));
    else if (!exists && errors.value.email === $t('errors.EMAIL_ALREADY_EXISTS')) {
      setFieldError('email', undefined);
    }
  },
);

watch(errors, (errs) => {
  if (!errs.email && emailExists.value) {
    setFieldError('email', $t('errors.EMAIL_ALREADY_EXISTS'));
  }
});
</script>

<template>
  <UiDialog
    :open="changeEmailStore.isOpen && changeEmailStore.step === 'email'"
    @update:open="changeEmailStore.handleDialogChange"
  >
    <UiDialogContent>
      <form
        class="flex h-full flex-col justify-between"
        data-cy="change-email-form"
        @submit.prevent="onSubmit"
      >
        <UiDialogHeader class="py-6">
          <UiDialogTitle class="text-4xl font-bold">{{
            $t('setting.change-email.title')
          }}</UiDialogTitle>
          <UiDialogDescription>
            {{
              $t('setting.change-email.description', {
                email: userStore.user?.email,
              })
            }}
          </UiDialogDescription>
        </UiDialogHeader>
        <div class="flex flex-col gap-4">
          <FieldInput
            placeholder="Email"
            type="text"
            name="email"
            v-bind="emailAttrs"
            data-cy="change-email-form-input"
          />
        </div>
        <UiDialogFooter class="mt-auto">
          <Button
            type="submit"
            :disabled="Object.entries(errors).length > 0 || isSubmitting"
            size="xl"
            class="w-full"
            data-cy="change-email-form-next-btn"
            >{{ $t('ui.next') }}</Button
          >
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
