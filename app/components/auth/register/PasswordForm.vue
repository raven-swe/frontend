<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { createPasswordSchema } from '~/schemas/auth';

const registerStore = useRegisterStore();
const { t } = useI18n();

const schema = yup.object({
  password: createPasswordSchema(t),
});
const { errors, defineField, handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    password: '',
  },
});

const onSubmit = handleSubmit(async (values) => {
  const errors = await registerStore.submitPassword(values.password.trim());
  if (errors) {
    setErrors(backendValidationToFormErrors(errors, t));
  }
});

const [_password, passwordAttrs] = defineField('password');
</script>

<template>
  <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
    <UiDialogHeader class="py-6">
      <UiDialogTitle class="text-4xl font-bold">{{ $t('register.password.title') }}</UiDialogTitle>
      <UiDialogDescription>
        {{ $t('register.password.description') }}
      </UiDialogDescription>
    </UiDialogHeader>
    <div class="flex flex-col gap-2">
      <FieldInput
        :placeholder="$t('register.password.label')"
        type="password"
        name="password"
        v-bind="passwordAttrs"
      />
    </div>
    <UiDialogFooter class="mt-auto flex flex-col gap-4">
      <p class="text-muted-foreground text-sm">
        {{ $t('register.password.disclaimer') }}
      </p>
      <Button
        type="submit"
        :disabled="Object.entries(errors).length > 0 || isSubmitting"
        size="xl"
        class="w-full"
        >{{ $t('ui.next') }}</Button
      >
    </UiDialogFooter>
  </form>
</template>
