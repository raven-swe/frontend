<script setup lang="ts">
import { navigateTo } from '#app';

const route = useRoute();
const query = route.query.q ? `?q=${route.query.q}` : '';
navigateTo(`/search/top${query}`, { redirectCode: 301 });
</script>

<template>
  <div></div>
</template>
