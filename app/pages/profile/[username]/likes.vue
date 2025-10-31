<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const likedPosts = [
  { id: 1, content: 'Liked Post 1' },
  { id: 2, content: 'Liked Post 2' },
  { id: 3, content: 'Liked Post 3' },
];
</script>
<template>
  <div>
    <div v-for="post in likedPosts" :key="post.id">
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>
