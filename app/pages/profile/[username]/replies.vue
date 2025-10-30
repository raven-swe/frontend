<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const replies = [
  { id: 1, content: 'reply 1' },
  { id: 2, content: 'reply 2' },
  { id: 3, content: 'reply 3' },
];
</script>
<template>
  <div>
    <div v-for="reply in replies" :key="reply.id">
      <p>{{ reply.content }}</p>
    </div>
  </div>
</template>
