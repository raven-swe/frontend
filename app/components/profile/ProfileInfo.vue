<script lang="ts" setup>
import type { User } from '~~/shared/types/user';
import { formatMonthYear } from '~/utils/date';
import { cleanUrl } from '~/utils/cleanUrl';

const userProfile = inject<ComputedRef<User>>('user-data');

const isMuted = computed(() => userProfile?.value.relationship.muted || false);
const isBlocking = computed(() => userProfile?.value.relationship.blocking || false);

const displayUsername = computed(() => '@' + userProfile?.value.username);
const displayUrl = computed(() => {
  if (userProfile?.value?.websiteUrl) {
    const cleanedUrl = cleanUrl(userProfile.value.websiteUrl);
    return cleanedUrl.length > 30 ? cleanedUrl.slice(0, 29) + '...' : cleanedUrl;
  }
  return '';
});
</script>

<template>
  <div class="mt-2 flex flex-col" data-cy="profile-info">
    <div class="px-4">
      <h2
        class="text-foreground line-clamp-2 pb-0 text-2xl font-bold break-words"
        data-cy="profile-display-name"
      >
        {{ userProfile?.displayName }}
      </h2>
      <p class="text-muted-foreground text-md" data-cy="profile-user-name">{{ displayUsername }}</p>
      <p
        v-if="!isBlocking"
        class="mt-2 line-clamp-4 break-words whitespace-pre-line"
        data-cy="profile-bio"
      >
        <UiContentEntitiesRenderer
          :content="userProfile?.bio ?? ''"
          :entities="
            userProfile?.bioEntities ?? {
              mentions: [],
              hashtags: [],
            }
          "
        />
      </p>

      <div v-if="!isBlocking" class="mt-2 flex flex-wrap gap-2">
        <!-- location -->
        <p
          v-if="userProfile?.location"
          class="text-muted-foreground flex items-center gap-1 leading-tight"
        >
          <Icon name="ic:sharp-location-on" class="text-muted-foreground" size="18" />
          <span data-cy="profile-location">{{ userProfile.location }}</span>
        </p>

        <!-- url -->
        <a
          v-if="userProfile?.websiteUrl"
          :href="userProfile?.websiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-brand-blue me-2 flex items-center gap-1 hover:underline"
          data-cy="profile-website-url"
        >
          <Icon class="text-muted-foreground" name="ic:sharp-link" size="18" />
          <span>{{ displayUrl }}</span>
        </a>

        <!-- join date -->
        <p v-if="userProfile?.joinedAt" class="text-muted-foreground flex items-center gap-1">
          <Icon name="ic:sharp-calendar-month" />
          {{ $t('profile-info.joined') }}
          <span data-cy="profile-joined-at">{{ formatMonthYear(userProfile.joinedAt) }}</span>
        </p>
      </div>

      <div class="mt-4 flex space-x-4">
        <NuxtLink
          :to="`/profile/${userProfile?.username}/following`"
          class="hover:underline"
          data-test="following-count"
          ><strong data-cy="profile-following-count">{{
            $n(userProfile?.followingCount ?? 0, {
              notation: 'compact',
            })
          }}</strong>
          <span class="text-muted-foreground"> {{ ' ' + $t('profile-info.following') }} </span>
        </NuxtLink>
        <NuxtLink
          :to="`/profile/${userProfile?.username}/followers`"
          class="hover:underline"
          data-test="followers-count"
          ><strong data-cy="profile-followers-count">{{
            $n(userProfile?.followersCount ?? 0, {
              notation: 'compact',
            })
          }}</strong>
          <span class="text-muted-foreground ms-1"> {{ $t('profile-info.followers') }} </span>
        </NuxtLink>
      </div>
      <div v-if="isMuted" class="mt-4">
        <p class="text-muted-foreground text-sm">
          {{ $t('profile-info.user-muted') }}
        </p>
      </div>
    </div>
  </div>
</template>
