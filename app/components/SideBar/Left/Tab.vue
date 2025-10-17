<script lang="ts" setup>
import type { LeftSidebarTab } from '~/types/leftsidebar';

const props = defineProps<{
  tab: LeftSidebarTab;
}>();

const route = useRoute();
const isActive = computed(() => {
  if (props.tab.route === '#') return false;
  return route.path.startsWith(props.tab.route);
});
const textStyle = computed(() => (isActive.value ? 'font-bold' : 'font-normal'));
const iconType = computed(() => (isActive.value ? 'heroicons-solid' : 'heroicons-outline'));
</script>

<template>
  <NuxtLink
    :to="tab.route"
    class="text-foreground hover:bg-accent flex w-min items-center justify-start rounded-full p-3"
  >
    <div class="text-foreground">
      <Icon :name="`${iconType}:${tab.icon}`" size="24" />
    </div>

    <div class="ms-3 hidden text-xl xl:block" :class="textStyle">
      {{ $t(`leftsidebar.nav.${tab.label}`) }}
    </div>
  </NuxtLink>
</template>
