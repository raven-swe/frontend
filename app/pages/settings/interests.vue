<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { settingsService } from '~/services/settingsService';
import * as yup from 'yup';
import { useFieldArray, useForm } from 'vee-validate';
import InterestEntry from '~/components/Settings/InterestEntry.vue';

definePageMeta({ layout: 'settings' });

const formSchema = yup.object({
  interests: yup
    .array()
    .of(yup.string().required())
    .min(1, $t('errors.interests.REQUIRED'))
    .required(),
});

const extractSelected = (newData: ApiSuccessResponse<Interest[]> | undefined) => {
  if (!newData) return [] as string[];
  return newData.data.filter((interest) => interest.isSelected).map((interest) => interest.code);
};

const { t } = useI18n();
const queryClient = useQueryClient();

const {
  data: interestsResponse,
  suspense,
  isLoading,
} = useQuery({
  queryKey: ['interests'],
  queryFn: async () => await settingsService.getInterests(),
  staleTime: Infinity,
});

const { handleSubmit, setErrors, resetForm } = useForm<yup.InferType<typeof formSchema>>({
  validationSchema: formSchema,
  initialValues: {
    interests: [],
  },
});

const { fields, push, remove } = useFieldArray<string>('interests');

const updateInterestsMutation = useMutation({
  mutationFn: (interests: string[]) => settingsService.updateInterests(interests),
  onSuccess: () => {
    showToaster('success', t('setting.interests.update-success'));
    queryClient.invalidateQueries({ queryKey: ['interests'] });
  },
  onError: (error) => {
    if (isApiValidationError(error)) {
      const converted = backendValidationToFormErrors(error.data?.data?.error.errors || [], t);
      setErrors(converted);
    } else if (isApiError(error)) {
      const errorCode = error.data?.data?.error?.code;
      showToaster('error', t(`errors.${errorCode}`));
    } else {
      showToaster('error', t('errors.UNKNOWN_ERROR'));
    }
  },
});

const onSubmit = handleSubmit((values) => {
  updateInterestsMutation.mutate(values.interests);
});

const handleToggleInterest = (code: string) => {
  const index = fields.value.findIndex((field) => field.value === code);
  if (index !== -1) {
    remove(index);
  } else {
    push(code);
  }
};

const isInterestActive = (code: string) => {
  return fields.value.some((field) => field.value === code);
};

watch(
  () => interestsResponse.value,
  (newData) => {
    if (!newData) return;
    if (import.meta.env.SSR) return;
    resetForm({
      values: {
        interests: extractSelected(newData),
      },
    });
  },
  { immediate: true },
);

onServerPrefetch(async () => {
  await suspense();
  resetForm({
    values: {
      interests: extractSelected(interestsResponse.value) || [],
    },
  });
});
</script>

<template>
  <div class="flex h-full max-h-screen flex-col overflow-hidden">
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="bg-transparent"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.interests.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.interests.description') }}
      </p>
    </div>
    <form class="mt-3 flex h-full flex-1 flex-col overflow-hidden" @submit.prevent="onSubmit">
      <div v-if="interestsResponse" class="scroll-theme flex-1 overflow-y-auto">
        <InterestEntry
          v-for="interest in interestsResponse.data"
          :key="interest.code"
          :interest="interest"
          :is-active="isInterestActive(interest.code)"
          @toggle-interest="handleToggleInterest(interest.code)"
        />
      </div>
      <div v-if="isLoading" class="flex flex-1 items-center justify-center overflow-y-auto">
        <UiSpinner class="text-primary" />
      </div>
      <UiButton class="m-4" size="lg" variant="default">
        {{ $t('ui.save') }}
      </UiButton>
    </form>
  </div>
</template>

<style scoped>
.scroll-theme {
  scrollbar-color: rgb(62, 65, 68) rgb(22, 24, 28);
}
</style>
