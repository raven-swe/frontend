<script lang="ts" setup>
import { loginService } from '~/services/auth/loginService';
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import { useI18n } from '#imports';
import { useTheme } from '~/composables/useTheme';

const dmUnseenCount = inject<Ref<number>>('dmUnseenCount', ref(0));

const { locale, setLocale } = useI18n();
const { mode, toggleTheme } = useTheme();

const userStore = useUserStore();
const queryClient = useQueryClient();

const handleLogout = async () => {
  await loginService.logout();
  queryClient.removeQueries({ queryKey: ['layout-data'] });
};

const lang = ref(locale.value);

const switchLanguage = () => {
  setLocale(lang.value);

  if (lang.value === 'en-US') {
    lang.value = 'ar-EG';
  } else {
    lang.value = 'en-US';
  }
};
</script>
<template>
  <div class="flex h-screen flex-col items-center xl:items-start">
    <div class="my-2 w-min p-2 hover:rounded-full">
      <NuxtLink to="/">
        <LogoRaven class="h-14 w-14" />
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
        :tab="{
          label: 'messages',
          icon: 'chat',
          route: '/messages',
          badgeCount: dmUnseenCount,
        }"
      ></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{
          label: 'profile',
          icon: 'person',
          route: `/profile/${userStore.user?.username || ''}`,
        }"
      ></SideBarLeftTab>
      <SideBarLeftTab
        :tab="{ label: 'settings', icon: 'settings', route: '/settings/account' }"
        data-cy="sidebar-settings-btn"
      ></SideBarLeftTab>
      <UiButton variant="ghost-default" size="icon-xl" @click="switchLanguage">
        <Icon name="material-symbols:language" size="24" />
      </UiButton>
      <UiButton variant="ghost-default" size="icon-xl" @click="toggleTheme">
        <Icon
          :name="
            mode === 'dark' ? 'material-symbols:light-mode-outline' : 'material-symbols:nightlight'
          "
          size="24"
        />
      </UiButton>
      <UiButton
        variant="ghost-default"
        size="icon-xl"
        data-cy="logout-button"
        @click="handleLogout"
      >
        <Icon name="ic:outline-logout" size="24" />
      </UiButton>
    </div>
  </div>
</template>
