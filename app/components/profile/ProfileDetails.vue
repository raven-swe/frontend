<script lang="ts" setup>
import type { User } from '~~/shared/types/user';

defineProps<{
  userProfile: User;
}>();
</script>
<template>
  <div>
    <ProfileCover :cover-img="userProfile.bannerUrl" />
    <ProfileAvatarSection :profile-img="userProfile.avatarUrl" />
    <ProfileInfo :user-profile="userProfile" />
  </div>
</template>
