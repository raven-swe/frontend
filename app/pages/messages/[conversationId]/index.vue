<script lang="ts" setup>
import { useRoute } from 'vue-router';
definePageMeta({ layout: false });
useRoute();
</script>
<template>
  <NuxtLayout name="settings" :hide-middle-on-mobile="true">
    <template #middle>
      <DmConversationsSection />
    </template>
    <template #right>
      <DmConversationView />
    </template>
  </NuxtLayout>
</template>
