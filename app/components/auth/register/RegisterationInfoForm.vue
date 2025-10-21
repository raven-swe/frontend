<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';
import useDateSelect from '@/composables/useDateSelect';
import Select from '~/components/ui/Select.vue';

const registerStore = useRegisterStore();
const today = new Date();
const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
const schema = yup.object({
  email: yup.string().min(1, $t('errors.INVALID_EMAIL')).email($t('errors.INVALID_EMAIL')),
  name: yup.string().min(1, $t('errors.NAME_TOO_SHORT')).max(50, $t('errors.NAME_TOO_LONG')),
  birthDate: yup
    .date()
    .typeError($t('errors.AGE_RESTRICTION'))
    .required($t('errors.AGE_RESTRICTION'))
    .max(thirteenYearsAgo, $t('errors.AGE_RESTRICTION')), // at least 13 years old
});
const { errors, values, defineField, handleSubmit, isSubmitting, setFieldError, setFieldValue } =
  useForm<yup.InferType<typeof schema>>({
    validationSchema: schema,
    initialValues: {
      name: registerStore.registerationInfo?.name ?? '',
      email: registerStore.registerationInfo?.email ?? '',
      birthDate: registerStore.registerationInfo?.birthDate
        ? new Date(registerStore.registerationInfo.birthDate)
        : undefined,
    },
  });

const onSubmit = handleSubmit(async (values) => {
  if (!values.birthDate) {
    setFieldError('birthDate', $t('errors.AGE_RESTRICTION'));
    return;
  }
  if (!values.birthDate || !values.email || !values.name) return;

  // Format date as yyyy-mm-dd
  const formattedBirthDate = values.birthDate.toISOString().split('T')[0] as string;
  const vals = {
    name: values.name,
    email: values.email,
    birthDate: formattedBirthDate,
  };
  await registerStore.submitRegisterationInfo(vals);
});

const [_email, emailAttrs] = defineField('email');
const [_name, nameAttrs] = defineField('name');

const emailExists = ref(false);

const checkEmail = useDebounceFn(async (email: string | undefined) => {
  if (!email) return;
  try {
    const res = await $fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    emailExists.value = !!res.data.exists;

    if (emailExists.value) {
      setFieldError('email', $t('errors.EMAIL_ALREADY_EXISTS'));
    } else {
      if (errors.value.email === $t('errors.EMAIL_ALREADY_EXISTS')) {
        setFieldError('email', undefined);
      }
    }
  } catch (err) {
    console.error('Failed to check email', err);
  }
}, 300);
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
const dateSelect = useDateSelect(
  new Date().getFullYear() - 100,
  new Date().getFullYear(),
  values.birthDate,
);

watch([dateSelect.selectedDay, dateSelect.selectedMonth, dateSelect.selectedYear], () => {
  const day = dateSelect.selectedDay.value;
  const month = dateSelect.selectedMonth.value;
  const year = dateSelect.selectedYear.value;
  if (day && month && year) {
    const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (birthDate.getDate() === Number(day)) {
      setFieldValue('birthDate', birthDate);
    }
  }
});
</script>

<template>
  <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
    <DialogHeader class="py-6">
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
        <div class="flex gap-2">
          <Select
            v-model="dateSelect.selectedMonth.value"
            class="flex-1/2"
            :options="dateSelect.months.value"
            placeholder="Month"
            name="birth-month"
          />
          <Select
            v-model="dateSelect.selectedDay.value"
            class="flex-1/4"
            :options="dateSelect.days.value"
            placeholder="Day"
            name="birth-day"
          />
          <Select
            v-model="dateSelect.selectedYear.value"
            class="flex-1/4"
            :options="dateSelect.years.value"
            placeholder="Year"
            name="birth-year"
          />
        </div>
        <p
          v-if="errors.birthDate"
          data-test-id="birth-date-error"
          class="text-destructive ps-1 text-xs"
        >
          {{ errors.birthDate }}
        </p>
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
