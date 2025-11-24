<script setup lang="ts">
import settings from '~/components/Settings/SettingsSection/index.vue';
definePageMeta({ layout: false });
</script>

<template>
  <NuxtLayout name="settings">
    <template #middle>
      <!-- Static account settings overview component -->
      <settings />
    </template>
    <template #right>
      <!-- Child route content (index/email/username/changePasswordEditor) renders here -->
      <NuxtPage />
    </template>
  </NuxtLayout>
</template>
