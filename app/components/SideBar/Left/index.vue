<script lang="ts" setup>
import { loginService } from '~/services/auth/loginService';
const userStore = useUserStore();
</script>
<template>
  <div class="flex h-screen flex-col items-center xl:items-start">
    <div class="hover:bg-foreground/10 my-2 w-min p-2 hover:rounded-full">
      <NuxtLink to="/">
        <LogoRaven class="h-8 w-8" />
      </NuxtLink>
    </div>
    <div class="mt-2 flex flex-col items-center space-y-3 xl:items-start">
      <SideBarLeftTab :tab="{ label: 'home', icon: 'home', route: '/home' }"></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{ label: 'explore', icon: 'search', route: '/explore' }"
      ></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{ label: 'notifications', icon: 'notifications', route: '/notifications' }"
      ></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{ label: 'messages', icon: 'chat', route: '/messages' }"
      ></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{
          label: 'profile',
          icon: 'person',
          route: `/profile/${userStore.user?.username || ''}`,
        }"
      ></SideBarLeftTab>
      <SideBarLeftTab :tab="{ label: 'more', icon: 'more-horiz', route: '#' }"></SideBarLeftTab>
      <UiButton variant="ghost-default" size="icon-xl" @click="loginService.logout()">
        <Icon name="ic:outline-logout" size="24" />
      </UiButton>
    </div>
  </div>
</template>
