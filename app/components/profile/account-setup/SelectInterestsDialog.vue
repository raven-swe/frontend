<script lang="ts" setup>
import { useFieldArray, useForm } from 'vee-validate';
import * as yup from 'yup';
import { settingsService } from '~/services/settingsService';
import InterestItem from './InterestItem.vue';
import { useQuery } from '@tanstack/vue-query';
import useAccountSetup from '~/composables/useAccountSetup';

const props = defineProps<{
  open: boolean;
}>();

const interestsSchema = yup.array().of(yup.string()).min(1, $t('errors.interests.REQUIRED'));

const { handleSubmit, isFieldValid } = useForm({
  validationSchema: yup.object({
    interests: interestsSchema,
  }),
  initialValues: {
    interests: [],
  },
});
const { fields, push, remove, replace } = useFieldArray<string>('interests');

const { data: interestsData } = useQuery({
  queryKey: ['interests'],
  queryFn: async () => await settingsService.getInterests(),
  staleTime: Infinity,
});

watch(
  () => interestsData?.value,
  (newData) => {
    if (newData?.data) {
      const selected = newData.data.interests
        .filter((interest) => interest.isSelected)
        .map((interest) => interest.code);
      replace(selected);
    }
  },
  { immediate: true },
);

const { handleInterestsSubmit } = useAccountSetup();
const { t } = useI18n();
const onSubmit = handleSubmit(async (formValues, action) => {
  const errors = await handleInterestsSubmit(formValues.interests);
  if (errors) {
    const convertedErrors = backendValidationToFormErrors(errors, t);
    action.setErrors(convertedErrors);
  }
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

const translatedInterest = (interest: Interest) => {
  return $t(
    $te(`profile.account-setup.interests.${interest.code}`)
      ? `profile.account-setup.interests.${interest.code}`
      : interest.name,
  );
};
</script>

<template>
  <UiDialog :open="props.open">
    <UiDialogContent hide-close-button header-class="flex items-center justify-center p-0">
      <template #header>
        <LogoRaven class="size-8" />
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
            v-for="interest in interestsData?.data.interests || []"
            :key="interest.code"
            :interest="translatedInterest(interest)"
            :is-active="isInterestActive(interest.code)"
            @toggle-interest="handleToggleInterest(interest.code)"
          />
        </div>
        <UiDialogFooter
          class="mt-auto flex flex-row items-center justify-between border-t-1 px-8 pt-4"
        >
          <p v-if="fields.length <= 0" class="text-muted-foreground shrink-0 text-sm">
            {{
              $t('profile.account-setup.interests.selected-count', {
                count: fields.length,
              })
            }}
          </p>
          <p v-else class="text-foreground shrink-0 text-sm font-medium">
            {{
              $t('profile.account-setup.interests.selected-done', {
                count: fields.length,
              })
            }}
          </p>
          <!-- <p v-if="errors.interests" class="text-destructive text-sm">{{ errors.interests }}</p> -->
          <UiButton
            class="px-8"
            size="xl"
            :disabled="fields.length === 0 || !isFieldValid('interests')"
            type="submit"
          >
            {{ $t('ui.next') }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
