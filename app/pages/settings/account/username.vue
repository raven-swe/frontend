<script setup lang="ts">
import { ref, watch, computed } from 'vue';
// Removed explicit vue-router import to allow Nuxt auto-import & test mocking of useRouter
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import FieldInput from '~/components/ui/form/FieldInput.vue';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';
import { useUserStore } from '~/stores/user';
import { apiFetch } from '~/api';

definePageMeta({ layout: 'settings' });

const router = useRouter();
const userStore = useUserStore();

const suggestions = ref<string[]>([]);
const originalUsername = ref<string>(userStore.user?.username || '');
const usernameExists = ref(false);
const isChecking = ref(false);

try {
  const { data } = await apiFetch<ApiSuccessResponse<{ suggestions: string[] }>>(
    '/api/settings/username/suggestions',
    {
      method: 'GET',
      query: { baseUsername: userStore.user?.username || '' },
    },
  );
  if (data.suggestions) {
    suggestions.value = data.suggestions;
  }
} catch (error) {
  // Silently handle 404 or any other errors - just show no suggestions
  console.error('Could not load username suggestions:', error);
}

const schema = yup.object({
  username: yup
    .string()
    .required($t('setting.username.username-required'))
    .min(3, $t('setting.username.username-invalid'))
    .max(15, $t('setting.username.username-invalid'))
    .matches(/^[a-zA-Z0-9_]+$/, $t('setting.username.username-invalid')),
});

const { errors, values, defineField, handleSubmit, isSubmitting, setFieldError, setFieldValue } =
  useForm<yup.InferType<typeof schema>>({
    validationSchema: schema,
    initialValues: {
      username: userStore.user?.username || '',
    },
  });

const [_username, usernameAttrs] = defineField('username');

const checkUsernameAvailability = useDebounceFn(async (username: string) => {
  // Guard: skip network call if unchanged or invalid
  if (!username || errors.value.username) return;
  if (username === originalUsername.value) return;

  try {
    isChecking.value = true;
    const response = await $fetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
      '/api/auth/check-identifier',
      {
        method: 'GET',
        query: {
          identifier: username,
        },
      },
    );

    usernameExists.value = response.data.exists;

    if (response.data.exists) {
      setFieldError('username', $t('setting.username.username-taken'));
    }
  } catch (error) {
    // Handle different error status codes
    const err = error as { data?: { data: { error: { code: string } } } };
    const code = err.data?.data?.error.code;
    const errorKey = code ? `errors.username.${code}` : 'errors.username.error-checking';
    console.error('Error checking username:', errorKey);
    setFieldError('username', $t(errorKey));
  } finally {
    isChecking.value = false;
  }
}, 300);
const dynamicUsernameSuggestions = useDebounceFn(async (username: string) => {
  // Guard: skip suggestions fetch if unchanged or invalid
  if (!username || errors.value.username) return;
  if (username === originalUsername.value) return;

  try {
    const { data } = await apiFetch<ApiSuccessResponse<{ suggestions: string[] }>>(
      '/api/settings/username/suggestions',
      {
        method: 'GET',
        query: { baseUsername: username },
      },
    );
    if (data.suggestions) {
      suggestions.value = data.suggestions;
    }
  } catch (error) {
    // Silently handle 404 or any other errors - just show no suggestions
    console.error('Could not load username suggestions:', error);
  }
}, 300);

watch(
  () => values.username,
  (newUsername) => {
    usernameExists.value = false;

    if (!newUsername || errors.value.username) return;

    checkUsernameAvailability(newUsername);
    dynamicUsernameSuggestions(newUsername);
  },
);

watch(errors, (errs) => {
  if (!errs.username && usernameExists.value) {
    setFieldError('username', $t('setting.username.username-taken'));
  }
});

const onSubmit = handleSubmit(async (values) => {
  if (usernameExists.value) return;
  try {
    await apiFetch('/api/settings/username/update', {
      method: 'PATCH',
      query: {
        newUsername: values.username,
      },
    });

    // Update the user store with the new username
    userStore.updateUser({ username: values.username });

    router.push('/settings/account');
  } catch (error) {
    console.error('Error saving username:', error);
    setFieldError('username', $t('setting.username.error-saving'));
  }
});

// Disable the save button if the username hasn't changed
const isUnchangedUsername = computed(() => values.username === originalUsername.value);
// Only treat actual non-empty error messages as errors for disabling submit
const hasErrors = computed(() => Object.values(errors.value).some((msg) => !!msg));
</script>

<template>
  <form class="flex min-h-screen flex-col" @submit.prevent="onSubmit">
    <div class="mb-4 flex items-center gap-4 p-4">
      <Icon
        :name="$t('setting.back-button-icon')"
        size="1.5rem"
        class="cursor-pointer"
        to="/settings/account"
        @click="router.push('/settings/account')"
      />
      <h1 class="text-2xl font-bold">{{ $t('setting.username.change-username') }}</h1>
    </div>

    <div class="flex flex-1 flex-col">
      <div class="border-border border-b px-4 pb-8">
        <FieldInput
          data-cy="username-settings-input"
          name="username"
          :placeholder="$t('setting.username.username')"
          v-bind="usernameAttrs"
        />
      </div>

      <div class="border-border border-b px-4 py-8">
        <h2 class="mb-4 text-2xl font-bold">{{ $t('setting.username.suggestions') }}</h2>
        <div class="flex flex-col gap-2" data-cy="username-suggestions-list">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="text-primary cursor-pointer text-start hover:underline"
            @click="setFieldValue('username', suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
      <div class="flex justify-end px-4 py-8">
        <Button
          data-cy="username-settings-save"
          type="submit"
          :disabled="
            hasErrors || isSubmitting || isChecking || usernameExists || isUnchangedUsername
          "
          variant="primary"
          size="md"
          class="w-fit"
        >
          {{ $t('setting.username.save') }}
        </Button>
      </div>
    </div>
  </form>
</template>
