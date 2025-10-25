<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import Spinner from '~/components/ui/Spinner.vue';
const route = useRoute();
const username = computed(() => (route.params.username as string) || 'hussein');

const { userProfile, error, loading } = useUserProfile(username.value);
</script>

<template>
  <NuxtLayout name="default">
    <!-- Profile header and tabs (sticky across all profile pages) -->
    <div v-if="loading" class="flex justify-center p-4">
      <Spinner />
    </div>
    <div v-else-if="error" class="text-destructive p-4">
      {{ error.message }}
    </div>
    <template v-else-if="userProfile">
      <ProfileDetails :user-profile="userProfile" />
      <Tabs>
        <Tab
          :label="$t('profile.tabs.posts')"
          route="/profile"
          :is-active="$route.path === '/profile'"
        />
        <Tab
          :label="$t('profile.tabs.replies')"
          route="/profile/replies"
          :is-active="$route.path === '/profile/replies'"
        />
        <Tab
          :label="$t('profile.tabs.media')"
          route="/profile/media"
          :is-active="$route.path === '/profile/media'"
        />
        <Tabs
          :label="$t('profile.tabs.likes')"
          route="/profile/likes"
          :is-active="$route.path === '/profile/likes'"
        />
      </Tabs>

      <!-- Dynamic content from child tab pages -->
      <slot />
    </template>
  </NuxtLayout>
</template>
