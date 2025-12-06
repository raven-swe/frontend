import { useForm, useFieldArray } from 'vee-validate';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';
import { onServerPrefetch, watch } from 'vue';
import { settingsService } from '~/services/settingsService';

export const useInterestsForm = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const formSchema = yup.object({
    interests: yup
      .array()
      .required()
      .min(1, t('errors.interests.REQUIRED'))
      .of(yup.string().required()),
  });

  const extractSelected = (newData: ApiSuccessResponse<Interest[]> | undefined) => {
    if (!newData) return [] as string[];
    return newData.data.filter((interest) => interest.isSelected).map((interest) => interest.code);
  };

  const {
    data: interestsResponse,
    suspense,
    isLoading,
  } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => await settingsService.getInterests(),
    staleTime: Infinity,
  });

  const { handleSubmit, setErrors, resetForm, isSubmitting } = useForm<
    yup.InferType<typeof formSchema>
  >({
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

  const onSubmit = handleSubmit(async (values) => {
    await updateInterestsMutation.mutateAsync(values.interests);
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

  return {
    isLoading,
    isSubmitting,
    interests: computed(() => interestsResponse.value?.data),
    selectedOne: computed(() => fields.value.length > 0),
    onSubmit,
    handleToggleInterest,
    isInterestActive,
  };
};
