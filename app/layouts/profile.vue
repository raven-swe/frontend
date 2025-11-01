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

const { data, isLoading } = useQuery<ApiSuccessResponse<User>>({
  queryKey,
  queryFn: async () =>
    await apiFetch<ApiSuccessResponse<User>>(`/api/users/${username.value}/profile`),
  // Ensures query runs on the server and is hydrated on client
  staleTime: 1000 * 60 * 5, // optional: 5min cache
});
const user = computed(() => (data.value && data.value.success ? data.value.data : null));
</script>

<template>
  <NuxtLayout name="default">
    <!-- Profile header and tabs (sticky across all profile pages) -->
    <div v-if="isLoading" class="flex justify-center p-4">
      <Spinner />
    </div>

    <ProfileDetails v-if="!!user" :user-profile="user" />

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
        :label="$t('profile.tabs.likes')"
        :route="`${profilePath}/likes`"
        :is-active="$route.path === `${profilePath}/likes`"
      />
    </Tabs>

    <!-- Dynamic content from child tab pages -->
    <slot />
  </NuxtLayout>
</template>
