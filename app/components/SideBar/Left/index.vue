<script lang="ts" setup>
import { loginService } from '~/services/auth/loginService';
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import { useI18n } from '#imports';
import { useTheme } from '~/composables/useTheme';
import Avatar from '~/components/ui/Avatar.vue';
import PostTweetDialog from '~/components/tweet/composer/PostTweetDialog.vue';

const dmUnseenCount = inject<Ref<number>>('dmUnseenCount', ref(0));
const notificationUnseenCount = inject<Ref<number>>('unseenNotificationsCount', ref(0));

const { locale, setLocale } = useI18n();
const { mode, toggleTheme } = useTheme();
const showPostDialog = ref(false);

const userStore = useUserStore();
const queryClient = useQueryClient();

const handleLogout = async () => {
  await loginService.logout();
  await queryClient.clear();
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
        :tab="{
          label: 'notifications',
          icon: 'notifications',
          route: '/notifications',
          badgeCount: notificationUnseenCount,
        }"
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
        :tab="{ label: 'settings', icon: 'settings', route: '/settings' }"
        data-cy="sidebar-settings-btn"
      ></SideBarLeftTab>
      <UiButton class="mx-2 xl:w-auto" variant="default" size="lg" @click="showPostDialog = true">
        <div class="relative flex h-8 w-8 items-center justify-center">
          <Icon name="mingcute:quill-pen-ai-line" size="28" />
        </div>
        <p class="mx-6 hidden text-xl font-extrabold xl:block">{{ $t('ui.post') }}</p>
      </UiButton>
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
    </div>
    <div class="flex w-full flex-grow p-2 pb-4">
      <UiAlertDialog>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost-default"
              size="2xl"
              class="mx-auto mt-auto overflow-hidden xl:w-full"
              data-cy="logout-btn-trigger"
            >
              <div class="flex w-full items-center gap-3">
                <Avatar
                  :img="userStore.user?.avatarUrl || ''"
                  :alt="userStore.user?.displayName || 'User Avatar'"
                  size="sm"
                />
                <div class="hidden flex-col overflow-hidden text-start xl:flex">
                  <p class="truncate">{{ userStore.user?.displayName || 'User' }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ '@' + (userStore.user?.username || 'username') }}
                  </p>
                </div>
                <div class="ms-auto hidden xl:flex">
                  <Icon name="lucide:more-horizontal" class="pe-2" />
                </div>
              </div>
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="center" class="bg-background">
            <UiAlertDialogTrigger>
              <UiDropdownMenuItem data-cy="logout-button">
                {{ $t('ui.logout.label', { username: userStore.user?.username || 'username' }) }}
              </UiDropdownMenuItem>
            </UiAlertDialogTrigger>
          </UiDropdownMenuContent>
        </UiDropdownMenu>

        <UiAlertDialogContent>
          <UiAlertDialogHeader>
            <UiAlertDialogTitle>
              {{ $t('ui.logout.title') }}
            </UiAlertDialogTitle>
            <UiAlertDialogDescription>
              {{ $t('ui.logout.description') }}
            </UiAlertDialogDescription>
          </UiAlertDialogHeader>
          <UiAlertDialogFooter>
            <UiAlertDialogAction data-cy="confirm-logout-button" @click="handleLogout">
              {{ $t('ui.logout.confirm') }}
            </UiAlertDialogAction>
            <UiAlertDialogCancel>
              {{ $t('ui.cancel') }}
            </UiAlertDialogCancel>
          </UiAlertDialogFooter>
        </UiAlertDialogContent>
      </UiAlertDialog>
    </div>
    <PostTweetDialog v-model:open="showPostDialog" />
  </div>
</template>
