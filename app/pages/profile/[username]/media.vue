<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const postedMedia = [
  { id: 1, content: 'Media Post 1' },
  { id: 2, content: 'Media Post 2' },
  { id: 3, content: 'Media Post 3' },
];
</script>
<template>
  <div>
    <div v-for="media in postedMedia" :key="media.id">
      <p>{{ media.content }}</p>
    </div>
  </div>
</template>
