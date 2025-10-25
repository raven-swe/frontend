<script lang="ts" setup>
import type { UserProfile } from '~~/shared/types/user';
import { formatMonthYear } from '~/utils/date';
defineProps<{
  userProfile: UserProfile;
}>();
</script>
<template>
  <div class="mt-2 flex flex-col">
    <div class="px-4">
      <h2 class="text-foreground text-2xl font-bold">{{ userProfile.displayName }}</h2>
      <p class="text-muted-foreground">{{ userProfile.username }}</p>
      <p class="mt-2">{{ userProfile.bio }}</p>
      <p class="text-muted-foreground mt-2">
        <Icon name="ic:sharp-calendar-month" />
        {{ $t('profile-info.joined') }}
        {{ formatMonthYear(userProfile.joinedAt) }}
      </p>
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
