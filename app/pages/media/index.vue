<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ layout: 'media' });

// Redirect to home/following when visiting /media using router
const router = useRouter();
onMounted(() => {
  router.replace('/home/following');
});
</script>
<template>
  <div />
</template>
