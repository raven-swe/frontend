<script lang="ts" setup>
import Button from '~/components/ui/Button.vue';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '~/components/ui/dialog';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';

const registerStore = useRegisterStore();
const today = new Date();
const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
const schema = yup.object({
  email: yup.string().email($t('errors.INVALID_EMAIL')),
  name: yup.string().min(2, $t('errors.NAME_TOO_SHORT')),
  birthDate: yup
    .date()
    .typeError($t('errors.AGE_RESTRICTION'))
    .max(today, $t('errors.AGE_RESTRICTION')) // no future dates
    .max(thirteenYearsAgo, $t('errors.AGE_RESTRICTION')), // at least 13 years old
});
const { errors, defineField, handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    name: 'ahmed',
    email: 'ahmed@example.com',
    birthDate: '2005-01-01',
  },
  validateOnMount: true,
});

const onSubmit = handleSubmit(async (values) => {
  await registerStore.submitRegisterationInfo(values);
});

const [_email, emailAttrs] = defineField('email');
const [_name, nameAttrs] = defineField('name');
const [_birthDate, birthDateAttrs] = defineField('birthDate');
</script>

<template>
  <Dialog :open="registerStore.open" @update:open="(val: boolean) => (registerStore.open = val)">
    <DialogContent>
      <div class="flex flex-1 flex-col px-18">
        <DialogHeader class="py-10">
          <DialogTitle class="text-4xl font-bold">{{
            $t('register.register-info.title')
          }}</DialogTitle>
        </DialogHeader>
        <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
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
      </div>
    </DialogContent>
  </Dialog>
</template>
