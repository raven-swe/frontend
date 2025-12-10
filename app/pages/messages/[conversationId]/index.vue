<script lang="ts" setup>
definePageMeta({ layout: false });
</script>
<template>
  <NuxtLayout name="conversation" :hide-middle-on-mobile="true">
    <template #middle>
      <DmConversationsSection />
    </template>
    <template #right>
      <DmConversationView />
    </template>
  </NuxtLayout>
</template>
