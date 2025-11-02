<script lang="ts" setup>
import { useForm } from 'vee-validate';
import type { buttonVariants } from '~~/shared/types/ui';
import * as yup from 'yup';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { accountService } from '~/services/auth/accountService';

const props = defineProps<{
  open: boolean;
}>();

const _checkUsername = async (username: string) => {
  if (!username) return false;
  return await accountService.checkAccountExists(username);
};

const checkUsername = useDebounceFn(_checkUsername, 300);
const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;

const usernameSchema = yup
  .string()
  .trim()
  .matches(usernameRegex, $t('errors.INVALID_USERNAME'))
  .test('uniqueUsername', $t('errors.USERNAME_ALREADY_EXISTS'), async (username) => {
    if (!username || !usernameRegex.test(username)) return true;
    const exists = await checkUsername(username);
    return !exists;
  });

const { values, defineField, handleSubmit, isSubmitting, isFieldValid } = useForm({
  validationSchema: yup.object({
    username: usernameSchema.required(),
  }),
  initialValues: {
    username: '',
  },
});

const { handleUsernameSubmit } = useAccountSetup();
const onSubmit = handleSubmit(async (formValues) => {
  await handleUsernameSubmit(formValues.username);
});

const [_, usernameAttrs] = defineField('username');

const actionButton = computed(() => {
  const isUsernameSet = values.username.trim().length > 0;
  return {
    text: isUsernameSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isUsernameSet ? 'primary' : 'outline') as buttonVariants,
  };
});
</script>

<template>
  <UiDialog :open="props.open">
    <UiDialogContent
      hide-close-button
      header-class="flex items-center justify-center p-0"
      class="h-auto"
    >
      <template #header>
        <img src="https://placehold.co/32x32" class="size-8" />
      </template>
      <UiDialogHeader class="mx-auto w-full max-w-100">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.account-setup.username.title')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.account-setup.username.description') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <form class="flex flex-1 flex-col" @submit.prevent="onSubmit">
        <FieldInput
          :placeholder="$t('profile.account-setup.username.username-label')"
          class="mx-auto w-full max-w-100"
          v-bind="usernameAttrs"
          name="username"
        />
        <UiDialogFooter class="mt-auto">
          <UiButton
            :variant="actionButton.variant"
            class="w-full max-w-100"
            size="xl"
            :disabled="isSubmitting || !isFieldValid('username')"
            @click="handleSubmit"
          >
            {{ actionButton.text }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
