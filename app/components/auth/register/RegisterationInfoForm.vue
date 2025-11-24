<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';
import useDateSelect from '@/composables/useDateSelect';
import useRecaptcha from '@/composables/useRecaptcha';
import Select from '~/components/ui/Select.vue';
import { registerationService } from '~/services/auth/registerationService';

const { t } = useI18n();
const registerStore = useRegisterStore();
const schema = yup.object({
  email: yup.string().min(1, t('errors.INVALID_EMAIL')).email(t('errors.INVALID_EMAIL')),
  name: yup.string().min(1, t('errors.NAME_TOO_SHORT')).max(50, t('errors.NAME_TOO_LONG')),
  birthDate: yup
    .date()
    .typeError(t('errors.AGE_RESTRICTION'))
    .required(t('errors.AGE_RESTRICTION'))
    .test('age', t('errors.AGE_RESTRICTION'), function (birthdate) {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 13);
      return birthdate <= cutoff;
    }),
  recaptchaToken: yup
    .string()
    .required(t('errors.RECAPTCHA_REQUIRED'))
    .min(1, t('errors.RECAPTCHA_REQUIRED')),
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
      recaptchaToken: undefined,
    },
  });

const onSubmit = handleSubmit(async (values, actions) => {
  if (!values.birthDate || !values.email || !values.name) return;

  // Format date as yyyy-mm-dd
  const formattedBirthDate = values.birthDate?.toISOString()?.split('T')[0] as string;
  const vals = {
    name: values.name,
    email: values.email,
    birthDate: formattedBirthDate,
    recaptchaToken: values.recaptchaToken,
  };
  const errors = await registerStore.submitRegisterationInfo(vals);
  if (errors) {
    actions.setErrors(backendValidationToFormErrors(errors, t));
    resetRecaptcha(undefined);
    setFieldValue('recaptchaToken', '', true);
  }
});

const [_email, emailAttrs] = defineField('email');
const [_name, nameAttrs] = defineField('name');

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
const dateSelect = useDateSelect(
  new Date().getFullYear() - 100,
  new Date().getFullYear(),
  values.birthDate,
);

watch(
  [dateSelect.selectedDay, dateSelect.selectedMonth, dateSelect.selectedYear],
  ([day, month, year]) => {
    if (day && month && year) {
      const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (birthDate.getDate() === Number(day)) {
        setFieldError('birthDate', undefined);
        setFieldValue('birthDate', birthDate, true);
      }
    }
  },
);

const { render: renderRecaptcha, reset: resetRecaptcha } = useRecaptcha();

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
  <form
    class="flex h-full flex-col justify-between"
    data-cy="signup-info-form"
    @submit.prevent="onSubmit"
  >
    <UiDialogHeader class="py-6">
      <UiDialogTitle class="text-4xl font-bold">{{
        $t('register.register-info.title')
      }}</UiDialogTitle>
    </UiDialogHeader>
    <div class="flex flex-col gap-4">
      <FieldInput
        placeholder="Name"
        type="text"
        data-cy="signup-name"
        name="name"
        v-bind="nameAttrs"
      />
      <FieldInput
        placeholder="Email"
        type="text"
        data-cy="signup-email"
        name="email"
        v-bind="emailAttrs"
      />
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
            data-cy="signup-dob-month"
          />
          <Select
            v-model="dateSelect.selectedDay.value"
            class="flex-1/4"
            :options="dateSelect.days.value"
            placeholder="Day"
            name="birth-day"
            data-cy="signup-dob-day"
          />
          <Select
            v-model="dateSelect.selectedYear.value"
            class="flex-1/4"
            :options="dateSelect.years.value"
            placeholder="Year"
            name="birth-year"
            data-cy="signup-dob-year"
          />
        </div>
        <p
          v-if="errors.birthDate"
          data-test-id="birth-date-error"
          class="text-destructive ps-1 text-xs"
          data-cy="signup-dob-error"
        >
          {{ errors.birthDate }}
        </p>
      </div>
      <ClientOnly>
        <div>
          <div id="recaptcha-container" class="g-recaptcha"></div>
          <p v-if="errors.recaptchaToken" class="text-destructive text-xs">
            {{ errors.recaptchaToken }}
          </p>
        </div>
      </ClientOnly>
    </div>
    <UiDialogFooter class="mt-auto">
      <Button
        type="submit"
        :disabled="Object.entries(errors).length > 0 || isSubmitting"
        size="xl"
        class="w-full"
        data-cy="signup-next-button"
        >{{ $t('ui.next') }}</Button
      >
    </UiDialogFooter>
  </form>
</template>
