<script lang="ts" setup>
defineProps<{
  userProfile: User;
}>();
</script>
<template>
  <div>
    <ProfileCover :cover-img="userProfile.coverImg" />
    <ProfileAvatarSection :profile-img="userProfile.profileImg" />
    <ProfileInfo :user-profile="userProfile" />
  </div>
</template>
