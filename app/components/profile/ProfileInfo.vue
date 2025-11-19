<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import { formatMonthYear } from '~/utils/date';

const props = defineProps<{
  userProfile: User;
}>();

const displayUsername = computed(() => '@' + props.userProfile.username);
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
      <h2 class="text-foreground pb-0 text-2xl font-bold">{{ userProfile.displayName }}</h2>
      <p class="text-muted-foreground text-md">{{ displayUsername }}</p>
      <p class="text-muted-foreground mt-2 whitespace-pre-line">{{ userProfile.bio }}</p>

      <div class="mt-2 flex flex-wrap gap-2">
        <!-- location -->
        <p
          v-if="userProfile.location"
          class="text-muted-foreground flex items-center gap-1 text-sm leading-tight"
        >
          <Icon name="ic:sharp-location-on" class="text-muted-foreground" size="18" />
          {{ userProfile.location }}
        </p>

        <!-- url -->
        <a
          v-if="userProfile.websiteUrl"
          :href="userProfile.websiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-brand-blue me-2 flex items-center gap-1 text-sm hover:underline"
        >
          <Icon class="text-muted-foreground" name="ic:sharp-link" size="18" />
          {{ displayUrl }}
        </a>

        <!-- join date -->
        <p class="text-muted-foreground flex items-center gap-1 text-sm">
          <Icon name="ic:sharp-calendar-month" />
          {{ $t('profile-info.joined') }}
          {{ formatMonthYear(userProfile.joinedAt) }}
        </p>
      </div>

      <div class="text-muted-foreground mt-4 flex space-x-4">
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
