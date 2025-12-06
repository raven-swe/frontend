<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { settingsService } from '~/services/settingsService';
import * as yup from 'yup';
import { useFieldArray, useForm } from 'vee-validate';
import InterestEntry from '~/components/Settings/InterestEntry.vue';

definePageMeta({ layout: 'settings' });
const { t } = useI18n();
const queryClient = useQueryClient();

const interestsSchema = yup.array().of(yup.string()).min(1, $t('errors.interests.REQUIRED'));

const { handleSubmit, setErrors } = useForm({
  validationSchema: yup.object({
    interests: interestsSchema,
  }),
  initialValues: {
    interests: [],
  },
});

const { data: interestsResponse, suspense } = useQuery({
  queryKey: ['interests'],
  queryFn: async () => await settingsService.getInterests(),
  staleTime: Infinity,
  structuralSharing: false,
});

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

const initilizeSelectedInterests = (newData: ApiSuccessResponse<Interest[]> | undefined) => {
  if (newData?.data) {
    const selected = newData.data
      .filter((interest) => interest.isSelected)
      .map((interest) => interest.code);
    replace(selected);
  }
};

watch(
  () => interestsResponse.value,
  (newData) => {
    initilizeSelectedInterests(newData);
  },
);

const { fields, push, remove, replace } = useFieldArray<string>('interests');

const selectedSet = computed(() => new Set(fields.value.map((f) => f.value)));

const handleToggleInterest = (code: string) => {
  const index = fields.value.findIndex((field) => field.value === code);
  if (index !== -1) {
    remove(index);
  } else {
    push(code);
  }
};

const isInterestActive = (code: string) => {
  return selectedSet.value.has(code);
};

onServerPrefetch(async () => {
  await suspense();
  initilizeSelectedInterests(interestsResponse.value);
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
      <div v-if="interestsResponse" class="flex-1 overflow-y-auto">
        <InterestEntry
          v-for="interest in interestsResponse.data"
          :key="interest.code"
          :interest="interest"
          :is-active="isInterestActive(interest.code)"
          @toggle-interest="handleToggleInterest(interest.code)"
        />
      </div>
      <UiButton class="m-4" size="lg" variant="default">
        {{ $t('ui.save') }}
      </UiButton>
    </form>
  </div>
</template>
