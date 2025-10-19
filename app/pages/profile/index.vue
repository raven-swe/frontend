<script lang="ts" setup>
import ProfileAvatarSection from '~/components/profile/ProfileAvatarSection.vue';
import ProfileCover from '~/components/profile/ProfileCover.vue';
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
definePageMeta({
  layout: 'profile',
});

const posts = [
  { id: 1, content: 'Post 1' },
  { id: 2, content: 'Post 2' },
  { id: 3, content: 'Post 3' },
];
</script>

<template>
  <div>
    <div v-for="post in posts" :key="post.id">
      <p>{{ post.content }}</p>
    </div>
    <ProfileCover />
    <ProfileAvatarSection />
    <ProfileDetails />
  </div>
</template>
