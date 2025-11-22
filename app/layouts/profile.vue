<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import ProfileDetailsSkeleton from '~/components/profile/skeletons/ProfileDetailsSkeleton.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import { apiFetch } from '~/api';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';

const route = useRoute();
const username = computed(() => (route.params.username as string).toLowerCase());
const profilePath = computed(() => `/profile/${username.value}`);

const queryKey = computed(() => ['profile', username.value]);

const { data, isLoading, isError, error, suspense } = useQuery<
  ApiSuccessResponse<User>,
  FetchError<FetchError<ApiErrorResponse>>
>({
  queryKey,
  queryFn: async () => await apiFetch(`/api/users/${username.value}/profile`),
  staleTime: 1000 * 60 * 5, // 5min cache
  retry: false, // Don't retry on 404
});

const user = computed(() => (data.value && data.value.success ? data.value.data : null));
provide('user-data', user);
const { isCurrentUser } = useIsCurrentUser();

const isUserNotFound = computed(() => {
  if (!isError.value || !error.value) return false;
  const errorData = error.value;
  return errorData?.data?.data?.error.code === 'USER_NOT_FOUND' || errorData?.statusCode === 404;
});
const queryClient = useQueryClient();
watch(
  () => route.fullPath,
  () => {
    if (!user.value) return;

    queryClient.invalidateQueries({
      queryKey: ['profile', username.value],
    });
  },
);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <NuxtLayout name="default">
    <div v-if="isLoading">
      <ProfileDetailsSkeleton />
    </div>

    <!-- User not found -->
    <div
      v-else-if="isUserNotFound"
      class="flex flex-col items-center justify-center p-8 text-center"
    >
      <h1 class="mb-2 text-3xl font-bold">{{ $t('errors.ACCOUNT_NOT_FOUND') }}</h1>
      <p class="text-muted-foreground">{{ $t('errors.TRY_SEARCHING') }}</p>
    </div>

    <!-- Profile content -->
    <template v-else-if="user">
      <ProfileDetails />
      <template v-if="!user.relationship.blocking">
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
      <template v-else>
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <h1 class="mb-2 text-3xl font-bold">
            {{ $t('profile.messages.blocked', { username: user.username }) }}
          </h1>
        </div>
      </template>
    </template>
  </NuxtLayout>
</template>
