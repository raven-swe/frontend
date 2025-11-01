<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import Spinner from '~/components/ui/Spinner.vue';
import { apiFetch } from '~/api';
import { useQuery } from '@tanstack/vue-query';

const route = useRoute();
const username = computed(() => route.params.username as string);
const profilePath = computed(() => `/profile/${username.value}`);

const queryKey = computed(() => ['profile', username.value]);

const { data, isLoading, isError, error } = useQuery<ApiSuccessResponse<User>>({
  queryKey,
  queryFn: async () =>
    await apiFetch<ApiSuccessResponse<User>>(`/api/users/${username.value}/profile`),
  staleTime: 1000 * 60 * 5, // 5min cache
  retry: false, // Don't retry on 404
});

const user = computed(() => (data.value && data.value.success ? data.value.data : null));
const { isCurrentUser } = useIsCurrentUser();

const isUserNotFound = computed(() => {
  if (!isError.value || !error.value) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorData = error.value as any;
  return errorData?.data?.code === 'USER_NOT_FOUND' || errorData?.statusCode === 404;
});
</script>

<template>
  <NuxtLayout name="default">
    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center p-4">
      <Spinner />
    </div>

    <!-- User not found -->
    <div
      v-else-if="isUserNotFound"
      class="flex flex-col items-center justify-center p-8 text-center"
    >
      <h1 class="mb-2 text-3xl font-bold">{{ $t('errors.ACCOUNT_NOT_FOUND') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('errors.TRY_SEARCHING') }}</p>
    </div>

    <!-- Profile content -->
    <template v-else-if="user">
      <ProfileDetails :user-profile="user" />

      <Tabs>
        <Tab
          :label="$t('profile.tabs.posts')"
          :route="profilePath"
          :is-active="$route.path === profilePath"
        />
        <Tab
          :label="$t('profile.tabs.replies')"
          :route="`${profilePath}/replies`"
          :is-active="$route.path === `${profilePath}/replies`"
        />
        <Tab
          :label="$t('profile.tabs.media')"
          :route="`${profilePath}/media`"
          :is-active="$route.path === `${profilePath}/media`"
        />
        <Tab
          v-if="isCurrentUser"
          :label="$t('profile.tabs.likes')"
          :route="`${profilePath}/likes`"
          :is-active="$route.path === `${profilePath}/likes`"
        />
      </Tabs>

      <!-- Dynamic content from child tab pages -->
      <slot />
    </template>
  </NuxtLayout>
</template>
