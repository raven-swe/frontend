<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';

const registerStore = useRegisterStore();
const today = new Date();
const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
const schema = yup.object({
  email: yup.string().email($t('errors.INVALID_EMAIL')),
  name: yup.string().min(1, $t('errors.NAME_TOO_SHORT')).max(50, $t('errors.NAME_TOO_LONG')),
  birthDate: yup
    .date()
    .typeError($t('errors.AGE_RESTRICTION'))
    .max(today, $t('errors.AGE_RESTRICTION')) // no future dates
    .max(thirteenYearsAgo, $t('errors.AGE_RESTRICTION')), // at least 13 years old
});
console.log(registerStore.registerationInfo);
const { errors, values, defineField, handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: registerStore.registerationInfo,
  validateOnMount: true,
});

const onSubmit = handleSubmit(async (values) => {
  await registerStore.submitRegisterationInfo(values);
});

const [_email, emailAttrs] = defineField('email');
const [_name, nameAttrs] = defineField('name');
const [_birthDate, birthDateAttrs] = defineField('birthDate');

const emailExists = ref(false);

const checkEmail = useDebounceFn(async (email: string) => {
  emailExists.value = false;
  setFieldError('email', undefined);
  if (!email || errors.value.email) return; // skip if already invalid email format
  try {
    const res = await $fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    emailExists.value = res.data.exists;
  } catch (err) {
    console.error('Failed to check email', err);
  }
}, 500); // 500ms debounce
watch(
  () => values.email,
  (email) => {
    checkEmail(email);
  },
);

watch(errors, (errs) => {
  if (!errs.email && emailExists.value) {
    setFieldError('email', $t('errors.EMAIL_ALREADY_EXISTS'));
  }
});
</script>

<template>
  <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
    <DialogHeader class="py-10">
      <DialogTitle class="text-4xl font-bold">{{ $t('register.register-info.title') }}</DialogTitle>
    </DialogHeader>
    <div class="flex flex-col gap-4">
      <FieldInput placeholder="Name" type="text" name="name" v-bind="nameAttrs" />
      <FieldInput placeholder="Email" type="text" name="email" v-bind="emailAttrs" />
      <div>
        <h2 class="font-semibold">{{ $t('register.register-info.date-of-birth.title') }}</h2>
        <p class="text-muted-foreground mb-4 text-sm">
          {{ $t('register.register-info.date-of-birth.description') }}
        </p>
        <FieldInput
          placeholder="Date of Birth"
          type="date"
          name="birthDate"
          v-bind="birthDateAttrs"
        />
      </div>
    </div>
    <DialogFooter class="mt-auto">
      <Button
        type="submit"
        :disabled="Object.entries(errors).length > 0 || isSubmitting"
        size="xl"
        class="w-full"
        >{{ $t('ui.next') }}</Button
      >
    </DialogFooter>
  </form>
</template>
