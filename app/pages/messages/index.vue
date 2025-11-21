<script lang="ts" setup>
definePageMeta({
  layout: false,
});
</script>
<template>
  <NuxtLayout name="settings">
    <template #middle>
      <DmConversationsSection />
    </template>

    <template #right> </template>
  </NuxtLayout>
</template>
