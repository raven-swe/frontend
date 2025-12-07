<script lang="ts" setup>
import { useNotificationSound } from '@/composables/useNotificationSound';

const props = defineProps<{
  tab: LeftSidebarTab;
}>();

const route = useRoute();
const isActive = computed(() => {
  if (props.tab.route === '#') return false;
  return route.path.startsWith(props.tab.route);
});
const textStyle = computed(() => (isActive.value ? 'font-bold' : 'font-normal'));
const iconType = computed(() => (isActive.value ? '' : 'outline-'));
const { play } = useNotificationSound();

watch(
  () => props.tab.badgeCount,
  (newCount, oldCount) => {
    if (oldCount === undefined || newCount === undefined) return;
    if (newCount > oldCount) {
      play();
    }
  },
);
</script>

<template>
  <NuxtLink
    :to="tab.route"
    class="text-foreground hover:bg-foreground/10 flex items-center justify-start rounded-full p-4 xl:w-auto"
  >
    <div class="text-foreground relative flex h-8 w-8 items-center justify-center">
      <Icon :name="`ic:${iconType}${tab.icon}`" size="28" />
      <span
        v-if="tab.badgeCount && tab.badgeCount > 0"
        class="bg-primary text-primary-foreground absolute -top-3 -me-1 inline-flex h-6 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-semibold"
      >
        {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
      </span>
    </div>

    <div class="ms-4 hidden text-xl xl:block" :class="textStyle">
      {{ $t(`leftsidebar.nav.${tab.label}`) }}
    </div>
  </NuxtLink>
</template>
