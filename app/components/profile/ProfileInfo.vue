<script lang="ts" setup>
import type { UserProfile } from '~~/shared/types/user';
import { formatMonthYear } from '~/utils/date';
const props = defineProps<{
  userProfile: UserProfile;
}>();
const displayUrl = computed(() => {
  if (props.userProfile.websiteUrl) {
    const cleanedUrl = cleanUrl(props.userProfile.websiteUrl);
    return cleanedUrl.length > 30 ? cleanedUrl.slice(0, 29) + '...' : cleanedUrl;
  }
  return '';
});
</script>
<template>
  <div class="mt-2 flex flex-col">
    <div class="px-4">
      <h2 class="text-foreground text-2xl font-bold">{{ userProfile.displayName }}</h2>
      <p class="text-muted-foreground">{{ userProfile.username }}</p>
      <p class="mt-2">{{ userProfile.bio }}</p>
      <div class="mt-2 flex flex-wrap">
        <a
          :href="userProfile.websiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-brand-blue me-2 flex items-center gap-1 hover:underline"
        >
          <Icon class="text-muted-foreground" name="ic:sharp-link" size="18" />
          {{ displayUrl }}
        </a>

        <p class="text-muted-foreground flex items-center gap-1">
          <Icon name="ic:sharp-calendar-month" />
          {{ $t('profile-info.joined') }}
          {{ formatMonthYear(userProfile.joinedAt) }}
        </p>
      </div>
      <div class="mt-4 flex space-x-4">
        <span
          ><strong>{{ userProfile.followingCount }}</strong>
          <span class="text-muted-foreground ms-1"> {{ $t('profile-info.following') }} </span>
        </span>
        <span
          ><strong>{{ userProfile.followersCount }}</strong>
          <span class="text-muted-foreground ms-1"> {{ $t('profile-info.followers') }} </span>
        </span>
      </div>
    </div>
  </div>
</template>
