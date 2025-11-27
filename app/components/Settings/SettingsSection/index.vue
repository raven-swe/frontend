<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const isActiveTab = (tabRoute: string) => {
  return router.currentRoute.value.path === tabRoute;
};

const settingSections = [
  {
    title: 'setting.account-information',
    route: '/settings/account',
    cy: 'account-settings-btn',
  },
  {
    title: 'setting.privacy-settings.title',
    route: '/settings/privacy',
    cy: 'privacy-settings-btn',
  },
];
</script>
<template>
  <div>
    <h2 class="px-4 py-3 text-2xl font-bold">
      {{ $t('setting.settings') }}
    </h2>
    <div class="mt-10 flex flex-col">
      <div
        v-for="settingSetion in settingSections"
        :key="settingSetion.route"
        :data-cy="settingSetion.cy"
        class="text-md hover:bg-accent flex cursor-pointer items-center justify-between border-e-2 border-transparent px-4 py-3 transition-colors"
        :class="{
          'border-e-primary bg-accent': isActiveTab(settingSetion.route),
        }"
        @click="router.push(settingSetion.route)"
      >
        <div class="flex flex-col">
          <span class="text-lg leading-tight font-medium">{{ $t(settingSetion.title) }}</span>
        </div>
        <Icon :name="$t('setting.item-icon')" size="1.2rem" class="text-muted-foreground" />
      </div>
    </div>
  </div>
</template>
