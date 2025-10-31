<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import Spinner from '~/components/ui/Spinner.vue';

const route = useRoute();
const username = computed(() => route.params.username as string);
const profilePath = computed(() => `/profile/${username.value}`);
const userStore = useUserStore();

// reactivity for profiles of other users too
onMounted(() => {
  useUserStore().fetchUserProfile(username.value);
});
</script>

<template>
  <NuxtLayout name="default">
    <!-- Profile header and tabs (sticky across all profile pages) -->
    <div v-if="userStore.loading" class="flex justify-center p-4">
      <Spinner />
    </div>

    <div v-else-if="userStore.error" class="text-destructive p-4">
      {{ userStore.error }}
    </div>

    <div v-else-if="userStore.user">
      <ProfileDetails :user-profile="userStore.user" />

      <Tabs>
        <Tab
          :label="$t('profile.tabs.posts')"
          :route="`${profilePath}`"
          :is-active="$route.path === `${profilePath}`"
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
    </div>
  </NuxtLayout>
</template>
