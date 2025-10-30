<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import Input from '~/components/ui/Input.vue';
import Button from '~/components/ui/Button.vue';
import { useDebounceFn } from '@vueuse/core';
import { useUserStore } from '~/stores/user';
import { apiFetch } from '~/api';

const router = useRouter();
const userStore = useUserStore();

const username = ref(userStore.user?.username || '');
const usernameError = ref('');
const usernameExists = ref(false);
const isChecking = ref(false);

const suggestions = ref<string[]>([]);

const { data } = await apiFetch<ApiSuccessResponse<{ suggestions: string[] }>>(
  '/api/settings/username/suggestions',
  {
    method: 'GET',
  },
);
if (data.suggestions) {
  suggestions.value = data.suggestions;
}

const validateUsernameFormat = (username: string): string | null => {
  if (!username) {
    return 'Username is required';
  }

  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (username.length < 3 || username.length > 15 || !validPattern.test(username)) {
    return $t('setting.username.username-invalid');
  }
  return null;
};

const checkUsernameAvailability = useDebounceFn(async (username: string) => {
  if (!username) return;

  const formatError = validateUsernameFormat(username);
  if (formatError) {
    usernameError.value = formatError;
    return;
  }

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
      usernameError.value = $t('setting.username.username-taken');
    } else {
      usernameError.value = '';
    }
  } catch (error) {
    console.error('Error checking username:', error);
    usernameError.value = 'Error checking username availability';
  } finally {
    isChecking.value = false;
  }
}, 300);

watch(username, (newUsername) => {
  usernameError.value = '';
  usernameExists.value = false;

  if (!newUsername) {
    usernameError.value = 'Username is required';
    return;
  }

  const formatError = validateUsernameFormat(newUsername);
  if (formatError) {
    usernameError.value = formatError;
    return;
  }

  checkUsernameAvailability(newUsername);
});

const isSaveDisabled = computed(() => {
  return !!usernameError.value || isChecking.value || !username.value;
});

const saveUsername = async () => {
  if (isSaveDisabled.value) return;

  try {
    await apiFetch('/api/settings/username', {
      method: 'PATCH',
      query: {
        newUsername: username.value,
      },
    });

    // Update the user store with the new username
    userStore.updateUser({ username: username.value });

    router.push('/playground/settings');
  } catch (error) {
    console.error('Error saving username:', error);
    usernameError.value = $t('setting.username.error-saving');
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="mb-4 flex items-center gap-4 p-4">
      <Icon
        :name="$t('setting.back-button-icon')"
        size="1.5rem"
        class="cursor-pointer"
        to="/playground/settings"
        @click="router.push('/playground/settings')"
      />
      <h1 class="text-2xl font-bold">{{ $t('setting.username.change-username') }}</h1>
    </div>

    <div class="flex flex-1 flex-col">
      <div class="border-border border-b px-4 pb-8">
        <div>
          <Input
            v-model="username"
            :aria-invalid="!!usernameError"
            :placeholder="$t('setting.username.username')"
          />
          <p v-if="usernameError" class="text-destructive text-md mt-1 ps-1">
            {{ usernameError }}
          </p>
        </div>
      </div>

      <div class="border-border border-b px-4 py-8">
        <h2 class="mb-4 text-2xl font-bold">{{ $t('setting.username.suggestions') }}</h2>
        <div class="flex flex-col gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="text-primary cursor-pointer text-start hover:underline"
            @click="username = suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <div class="flex justify-end px-4 py-8">
        <Button
          :disabled="isSaveDisabled"
          class="bg-primary hover:bg-primary/90 rounded-full px-6 py-2 font-bold disabled:opacity-50"
          @click="saveUsername"
        >
          {{ $t('setting.username.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>
