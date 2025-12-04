<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isExplore = computed(() => route.path.startsWith('/explore'));

const goBack = () => {
  router.back();
};
</script>

<template>
  <NuxtLayout name="default">
    <div
      class="bg-background/60 fixed top-0 z-50 flex inline-flex h-30 w-full max-w-[598px] cursor-pointer flex-col items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
    >
      <div class="flex w-full">
        <UiButton v-if="!isExplore" variant="icon" size="icon" @click="goBack">
          <Icon class="ms-6" :name="$t('icons.back-button-icon')" size="1.3rem" />
        </UiButton>
        <UiSearchField :show-back-on-focus="isExplore" />
      </div>
      <slot name="tabs" />
    </div>
    <slot />
  </NuxtLayout>
</template>
