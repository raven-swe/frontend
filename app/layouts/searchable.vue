<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SearchSettingsDialog from '~/components/search/SearchSettingsDialog.vue';

const router = useRouter();
const route = useRoute();
const showSearchSettings = ref(false);

const isExplore = computed(() => route.path.startsWith('/explore'));

const goBack = () => {
  router.back();
};

const openSearchSettings = () => {
  showSearchSettings.value = true;
};
</script>

<template>
  <NuxtLayout name="default">
    <div
      class="bg-background/60 sticky top-0 z-50 flex w-full cursor-pointer flex-col items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
    >
      <div class="flex w-full items-center justify-between px-2">
        <UiButton v-if="!isExplore" variant="ghost-default" size="icon-lg" @click="goBack">
          <Icon :name="$t('icons.back-button-icon')" size="1.3rem" />
        </UiButton>
        <UiSearchField :show-back-on-focus="isExplore" />
        <UiButton
          v-if="!isExplore"
          variant="ghost-default"
          size="icon-lg"
          @click="openSearchSettings"
        >
          <Icon :name="'ic:more-horiz'" size="1.3rem" />
        </UiButton>
      </div>
      <SearchSettingsDialog v-model:open="showSearchSettings" />
      <slot name="tabs" />
    </div>
    <slot />
  </NuxtLayout>
</template>
