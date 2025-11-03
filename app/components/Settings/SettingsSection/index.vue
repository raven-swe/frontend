<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const isActiveTab = (tabRoute: string) => {
  return route.path === tabRoute;
};
</script>
<template>
  <div>
    <h2 class="px-4 py-3 text-2xl font-bold">
      {{ $t('setting.settings') }}
    </h2>
    <div
      class="text-md mt-10 flex cursor-pointer items-center justify-between px-4 py-[10px] transition-colors"
      :class="
        isActiveTab('/settings/account')
          ? 'bg-foreground/10 border-primary border-e-4'
          : 'hover:bg-foreground/10'
      "
      @click="router.push('/settings/account')"
    >
      <div class="flex flex-col">
        <span class="text-lg leading-tight font-medium">{{
          $t('setting.account-information')
        }}</span>
      </div>
      <Icon :name="$t('setting.item-icon')" size="1.2rem" class="text-muted-foreground" />
    </div>
  </div>
</template>
