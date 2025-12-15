<script lang="ts" setup>
import { loginService } from '~/services/auth/loginService';
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import PostTweetDialog from '~/components/tweet/composer/PostTweetDialog.vue';

const dmUnseenCount = inject<Ref<number>>('dmUnseenCount', ref(0));
const notificationUnseenCount = inject<Ref<number>>('unseenNotificationsCount', ref(0));

const showPostDialog = ref(false);

const userStore = useUserStore();
const queryClient = useQueryClient();

const handleLogout = async () => {
  await loginService.logout();
  queryClient.clear();
};
</script>

<template>
  <div class="flex h-screen flex-col items-start gap-2 px-2 pt-1">
    <NuxtLink to="/" class="size-12">
      <LogoRaven />
    </NuxtLink>
    <div class="flex w-full flex-col items-center xl:items-start">
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
      <UiButton
        class="mx-2 xl:w-auto"
        variant="default"
        size="lg"
        data-cy="open-post-tweet-dialog-btn"
        @click="showPostDialog = true"
      >
        <div class="relative flex h-8 w-8 items-center justify-center">
          <Icon name="mingcute:quill-pen-ai-line" size="28" />
        </div>
        <p class="mx-6 hidden text-xl font-extrabold xl:block">{{ $t('ui.post') }}</p>
      </UiButton>
    </div>
    <div class="flex w-full flex-grow pb-2">
      <UiAlertDialog>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost-default"
              class="mx-auto mt-auto flex !size-12.5 h-fit w-full items-center justify-center gap-0 overflow-hidden p-0 xl:!h-auto xl:!w-full xl:gap-2 xl:!p-3"
              data-cy="logout-btn-trigger"
            >
              <Avatar
                :img="userStore.user?.avatarUrl || ''"
                :alt="userStore.user?.displayName || 'User Avatar'"
                size="sm"
              />
              <div class="hidden w-full items-center gap-3 xl:flex">
                <div class="flex flex-col overflow-hidden text-start">
                  <p class="truncate">{{ userStore.user?.displayName || 'User' }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ '@' + (userStore.user?.username || 'username') }}
                  </p>
                </div>
                <div class="ms-auto flex" data-cy="user-actions-button">
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
            <UiAlertDialogTitle data-test="logout-dialog-title">
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
