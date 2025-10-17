<script lang="ts" setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import Button from '~/components/ui/Button.vue';

const registerStore = useRegisterStore();
const schema = yup.object({
  otp: yup.string().min(6, $t('errors.OTP_TOO_SHORT')).max(6, $t('errors.OTP_TOO_LONG')),
});
const { errors, defineField, handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    otp: '',
  },
});

const invalidOtp = ref(false);

const onSubmit = handleSubmit(async (values) => {
  invalidOtp.value = false;
  invalidOtp.value = !(await registerStore.submitOtp(values.otp));
});

watch(invalidOtp, (isInvalid) => {
  if (isInvalid) {
    setErrors({
      otp: $t('errors.INVALID_OTP'),
    });
  } else {
    setErrors({
      otp: undefined,
    });
  }
});

const [_otp, otpAttrs] = defineField('otp');
</script>

<template>
  <form class="flex h-full flex-col justify-between" @submit.prevent="onSubmit">
    <DialogHeader class="py-6">
      <DialogTitle class="text-4xl font-bold">{{ $t('register.otp.title') }}</DialogTitle>
      <DialogDescription>
        {{
          $t('register.otp.description', {
            email: registerStore.registerationInfo?.email,
          })
        }}
      </DialogDescription>
    </DialogHeader>
    <div class="flex flex-col gap-4">
      <FieldInput
        placeholder="Verification Code"
        inputmode="numeric"
        type="text"
        pattern="[0-9]*"
        name="otp"
        v-bind="otpAttrs"
      />
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
