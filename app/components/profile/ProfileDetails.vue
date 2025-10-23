<script lang="ts" setup>
import type { UserProfile } from '~~/shared/types/user';

defineProps<{
  userProfile: UserProfile;
}>();
</script>
<template>
  <div>
    <ProfileCover :cover-img="userProfile.coverImg" />
    <ProfileAvatarSection :profile-img="userProfile.profileImg" />
    <ProfileInfo :user-profile="userProfile" />
  </div>
</template>
