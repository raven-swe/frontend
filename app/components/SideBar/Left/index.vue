<script lang="ts" setup></script>
<template>
  <div class="flex h-screen flex-col">
    <div class="my-2 w-min p-2 hover:rounded-full hover:bg-blue-50 dark:bg-white/20">
      <NuxtLink to="/">
        <LogoRaven class="h-8 w-8" />
      </NuxtLink>
    </div>
    <div class="mt-2 space-y-3">
      <SideBarLeftTab active>
        <template #icon>
          <Icon name="heroicons-outline:home" size="24" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.home') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons:magnifying-glass" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.explore') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons-outline:bell" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.notifications') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons:envelope" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.messages') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons-outline:bookmark" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.bookmarks') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons-outline:user" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.profile') }}</template>
      </SideBarLeftTab>

      <SideBarLeftTab>
        <template #icon>
          <Icon size="24" name="heroicons-outline:ellipsis-horizontal-circle" />
        </template>
        <template #lable>{{ $t('leftsidebar.nav.more') }}</template>
      </SideBarLeftTab>
    </div>
  </div>
</template>
