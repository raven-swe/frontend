<script lang="ts" setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import { accountService } from '~/services/auth/accountService';
import { settingsService } from '~/services/settingsService';
import getUsernameSchema from '~/schemas/username';
import { useQuery } from '@tanstack/vue-query';
import type { ButtonVariants } from '~/components/ui/button/variants';
import { useUserStore } from '~/stores/user';
import useAccountSetup from '~/composables/useAccountSetup';

const props = defineProps<{
  open: boolean;
}>();

const { t } = useI18n();
const usernameSchemaBase = getUsernameSchema(t);

const debouncedCheckUsername = useDebounceFn(async (username: string) => {
  if (!username) return false;
  return await accountService.checkAccountExists(username);
}, 300);

const userStore = useUserStore();

const usernameSchema = usernameSchemaBase.test(
  'uniqueUsername',
  t('errors.USERNAME_ALREADY_EXISTS'),
  async (username, ctx) => {
    if (!username) return false;

    const current = userStore.user.username?.toLowerCase();
    const normalized = username.toLowerCase();
    if (normalized === current) return true;

    try {
      const exists = await debouncedCheckUsername(username);
      return !exists;
    } catch (error) {
      if (isApiError(error)) {
        const code = error.data?.data?.error?.code;
        return ctx.createError({
          message: t(`errors.username.${code}`),
        });
      }
      return ctx.createError({
        message: t('errors.UNKNOWN_ERROR'),
      });
    }
  },
);

const { values, defineField, handleSubmit, isSubmitting, isFieldValid, setFieldValue } = useForm({
  validationSchema: yup.object({
    username: usernameSchema.required(),
  }),
  initialValues: {
    username: userStore.user.username?.toString() || '',
  },
});

const usernameQueryKey = useDebounce(
  computed(() => ['username-suggestions', values.username]),
  300,
);

const { data: suggestions, isLoading } = useQuery({
  queryKey: usernameQueryKey,
  queryFn: async () => {
    const response = await settingsService.getUsernameSuggestions(values.username);
    return response.data.suggestions ?? [];
  },
  enabled: computed(() => !!values.username && isFieldValid('username')),
});

const { handleUsernameSubmit, goToNextStep } = useAccountSetup();

const onSubmit = handleSubmit(async (formValues, actions) => {
  const errors = await handleUsernameSubmit(formValues.username);
  if (errors) {
    const convertedErrors = backendValidationToFormErrors(errors, t);
    actions.setErrors(convertedErrors);
  }
});

const onSkip = async () => {
  goToNextStep();
};

const [_, usernameAttrs] = defineField('username');

const actionButton = computed(() => {
  const isUsernameSet = values.username.trim().length > 0;
  return {
    text: isUsernameSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isUsernameSet ? 'primary' : 'outline') as ButtonVariants['variant'],
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
        <LogoRaven class="size-8" />
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
        <div class="py-8">
          <div class="mx-auto w-full max-w-100">
            <h2 class="mb-4 text-2xl font-bold">{{ $t('setting.username.suggestions') }}</h2>
            <div v-if="isLoading">
              <UiSpinner class="text-primary" />
            </div>
            <div v-if="suggestions" data-test="suggestions-container" class="flex flex-col gap-2">
              <button
                v-for="(suggestion, index) in suggestions"
                :key="suggestion"
                type="button"
                class="text-primary cursor-pointer text-start hover:underline"
                :data-test="`suggestion-button-${index}`"
                @click="setFieldValue('username', suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
        <UiDialogFooter class="mt-auto">
          <UiButton
            :variant="actionButton.variant"
            class="w-full max-w-100"
            size="xl"
            data-test="submit-button"
            :disabled="
              (isSubmitting || !isFieldValid('username')) && values.username.trim().length > 0
            "
            @click="() => (values.username.trim().length > 0 ? onSubmit() : onSkip())"
          >
            {{ actionButton.text }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
