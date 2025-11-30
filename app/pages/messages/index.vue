<script lang="ts" setup>
definePageMeta({
  layout: false,
});
</script>
<template>
  <NuxtLayout name="settings" :hide-right-on-mobile="true">
    <template #middle>
      <DmConversationsSection />
    </template>

    <template #right>
      <DmConversationEmptyState />
    </template>
  </NuxtLayout>
</template>
