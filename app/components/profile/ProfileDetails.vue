<script lang="ts" setup>
import type { UserProfile } from '~~/shared/types/user';

defineProps<{
  userProfile: UserProfile;
}>();
</script>
<template>
  <div>
    <ProfileCover :cover-img="userProfile.bannerUrl" />
    <ProfileAvatarSection :profile-img="userProfile.avatarUrl" />
    <ProfileInfo :user-profile="userProfile" />
  </div>
</template>
