<script lang="ts" setup>
import { SIDEBAR_TABS } from '~/constants/leftsidebar';
</script>
<template>
  <div class="flex h-screen flex-col items-center xl:items-start">
    <div class="hover:bg-accent my-2 w-min p-2 hover:rounded-full">
      <NuxtLink to="/">
        <LogoRaven class="h-8 w-8" />
      </NuxtLink>
    </div>
    <div class="mt-2 flex flex-col items-center space-y-3 xl:items-start">
      <SideBarLeftTab v-for="tab in SIDEBAR_TABS" :key="tab.label" :tab />
    </div>
  </div>
</template>
