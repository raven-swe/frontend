<script lang="ts" setup>
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import type { FetchError } from 'ofetch';

const route = useRouter();

const username = computed(() => {
  const val = route.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});
const profilePath = computed(() => `/profile/${username.value}`);

const queryKey = computed(() => ['profile', username.value]);

// const isLoading = ref(true);
// const user = ref<User | null>(null);
const {
  data: user,
  isLoading,
  suspense,
} = useQuery<User, FetchError<FetchError<ApiErrorResponse>>>({
  queryKey,
  queryFn: async () => {
    return (await apiFetch(`/api/users/${username.value}/profile`)).data;
  },
  staleTime: 1000 * 60 * 5, // 5min cache
  retry: false, // Don't retry on 404
  structuralSharing: false, // Disable structural sharing to ensure reactivity
  enabled: computed(() => Boolean(username.value)),
});

provide('user-data', user);

const queryClient = useQueryClient();
watch(
  () => route.currentRoute.value.fullPath,
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
    <div class="bg-background/65 sticky top-0 z-10 backdrop-blur-md">
      <header class="flex items-center gap-6 p-2">
        <UiButton
          variant="ghost-default"
          size="icon-sm"
          class="bg-transparent"
          @click="route.back()"
        >
          <Icon name="ic:round-arrow-back" size="20" />
        </UiButton>
        <div v-if="user" class="flex flex-col items-start">
          <h1 class="text-foreground text-md text-center font-semibold">
            {{ user?.displayName }}
          </h1>
          <p class="text-muted-foreground text-sm">
            {{ '@' + user?.username }}
          </p>
        </div>
        <div v-if="isLoading" class="flex flex-col items-start">
          <div class="text-foreground text-md flex h-6 p-1 text-center font-semibold">
            <div class="bg-muted-foreground/50 h-full w-32 animate-pulse rounded" />
          </div>
          <div class="text-muted-foreground flex h-5 p-1 text-sm">
            <div class="bg-muted-foreground/50 h-full w-24 animate-pulse rounded" />
          </div>
        </div>
      </header>
      <UiTabs>
        <UiTab
          :route="`${profilePath}/followers`"
          :is-active="$route.path.toLowerCase() === `${profilePath}/followers`"
          label="Followers"
        />
        <UiTab
          :route="`${profilePath}/following`"
          :is-active="$route.path.toLowerCase() === `${profilePath}/following`"
          label="Following"
        />
      </UiTabs>
    </div>
    <NuxtPage />
  </NuxtLayout>
</template>
