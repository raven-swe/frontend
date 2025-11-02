<script lang="ts" setup>
import { useFieldArray, useForm } from 'vee-validate';
import * as yup from 'yup';
import { accountSettingsService } from '~/services/settings/accountSettingsService';
import InterestItem from './InterestItem.vue';

const props = defineProps<{
  open: boolean;
}>();

const interestsSchema = yup
  .array()
  .of(yup.string())
  .min(1, $t('errors.SELECT_AT_LEAST_ONE_INTEREST'));

const { handleSubmit, isFieldValid } = useForm({
  validationSchema: yup.object({
    interests: interestsSchema,
  }),
  initialValues: {
    interests: [],
  },
  validateOnMount: true,
});
const { fields, push, remove } = useFieldArray<string>('interests');

const { data: suggestionData } = useAsyncData(
  'available-interests',
  async () => await accountSettingsService.getInterests(),
);

const { handleInterestsSubmit } = useAccountSetup();
const onSubmit = handleSubmit(async (formValues) => {
  await handleInterestsSubmit(formValues.interests);
});
const handleToggleInterest = (interestId: string) => {
  const index = fields.value.findIndex((field) => field.value === interestId);

  if (index !== -1) {
    remove(index);
  } else {
    push(interestId);
  }
};
const isInterestActive = (interestId: string) => {
  return fields.value.some((field) => field.value === interestId);
};
</script>

<template>
  <UiDialog :open="props.open">
    <UiDialogContent hide-close-button header-class="flex items-center justify-center p-0">
      <template #header>
        <img src="https://placehold.co/32x32" class="size-8" />
      </template>
      <UiDialogHeader class="mx-auto w-full max-w-100">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.account-setup.interests.title')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.account-setup.interests.description') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <form class="flex h-full flex-1 flex-col overflow-y-hidden px-0" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 justify-center gap-4 overflow-y-auto px-4 py-2 sm:grid-cols-3">
          <InterestItem
            v-for="interest in suggestionData?.data"
            :key="interest.id"
            :interest="$t(`profile.account-setup.interests.${interest.code}`)"
            :is-active="isInterestActive(interest.id)"
            @toggle-interest="handleToggleInterest(interest.id)"
          />
        </div>
        <UiDialogFooter class="mt-auto items-end border-t-1 pt-4">
          <div class="mx-auto flex w-full max-w-100 justify-end">
            <UiButton
              class="px-8"
              size="xl"
              :disabled="fields.length === 0 || !isFieldValid('interests')"
              @click="handleSubmit"
            >
              {{ $t('ui.next') }}
            </UiButton>
          </div>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
