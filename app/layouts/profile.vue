<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import ProfileDetailsSkeleton from '~/components/profile/skeletons/ProfileDetailsSkeleton.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import { useQuery } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import { profileTabsService } from '~/services/profile/profileTabsService';

const router = useRouter();

const username = computed(() => {
  const val = router.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});
const profilePath = computed(() => `/profile/${username.value}`);

const queryKey = computed(() => ['profile', username.value]);

const {
  data: user,
  isLoading,
  isError,
  error,
  suspense,
  refetch,
} = useQuery<User, FetchError<FetchError<ApiErrorResponse>>>({
  queryKey,
  queryFn: async ({ signal }) => profileTabsService.getProfile(username.value!, signal),
  staleTime: 1000 * 60 * 5, // 5min cache
  retry: false, // Don't retry on 404
  structuralSharing: false, // Disable structural sharing to ensure reactivity
  enabled: computed(() => Boolean(username.value)),
});

provide('user-data', user);

const isUserNotFound = computed(() => {
  if (!isError.value || !error.value) return false;
  const errorData = error.value;
  return errorData?.data?.data?.error?.code === 'USER_NOT_FOUND' || errorData?.statusCode === 404;
});
watch(
  () => router.currentRoute.value.fullPath,
  async () => {
    if (!user.value) return;
    await refetch();
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
      data-cy="profile-not-found-message"
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
            :is-active="$route.path.toLowerCase() === profilePath"
            data-cy="profile-posts-tab"
          />
          <Tab
            :label="$t('profile.tabs.replies')"
            :route="`${profilePath}/replies`"
            :is-active="$route.path.toLowerCase() === `${profilePath}/replies`"
            data-cy="profile-replies-tab"
          />
          <Tab
            :label="$t('profile.tabs.media')"
            :route="`${profilePath}/media`"
            :is-active="$route.path.toLowerCase() === `${profilePath}/media`"
            data-cy="profile-media-tab"
          />
          <Tab
            :label="$t('profile.tabs.likes')"
            :route="`${profilePath}/likes`"
            :is-active="$route.path.toLowerCase() === `${profilePath}/likes`"
            data-cy="profile-likes-tab"
          />
        </Tabs>

        <!-- Dynamic content from child tab pages -->
        <slot />
      </template>
      <template v-else>
        <div class="flex flex-col items-center justify-center p-8 text-center">
          <h1 class="mb-2 text-3xl font-bold" data-cy="profile-blocked-message">
            {{ $t('profile.messages.blocked', { username: user.username }) }}
          </h1>
        </div>
      </template>
    </template>
  </NuxtLayout>
</template>
