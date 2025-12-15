<script lang="ts" setup>
import type { User } from '~~/shared/types/user';

const userProfile = inject<ComputedRef<User>>('user-data');
</script>
<template>
  <div>
    <ProfileCover :cover-img="userProfile?.bannerUrl ?? ''" />
    <ProfileAvatarSection />
    <ProfileInfo />
  </div>
</template>
