<script lang="ts" setup>
import { SIDEBAR_TABS } from '~/constants/leftsidebar';
</script>
<template>
  <div class="flex h-screen flex-col">
    <div class="hover:bg-accent my-2 w-min p-2 hover:rounded-full">
      <NuxtLink to="/">
        <LogoRaven class="h-8 w-8" />
      </NuxtLink>
    </div>
    <div class="mt-2 space-y-3">
      <SideBarLeftTab v-for="tab in SIDEBAR_TABS" :key="tab.label" :tab />
    </div>
  </div>
</template>
