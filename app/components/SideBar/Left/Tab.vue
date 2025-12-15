<script lang="ts" setup>
import { useNotificationSound } from '@/composables/useNotificationSound';

const props = defineProps<{
  tab: LeftSidebarTab;
}>();

const router = useRouter();
const isActive = computed(() => {
  if (props.tab.route === '#') return false;
  return router.currentRoute.value.path.startsWith(props.tab.route);
});
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
  <NuxtLink :to="tab.route" class="group flex h-12.5 w-full items-center">
    <div
      class="group-hover:bg-secondary/50 flex flex-row items-center gap-2 rounded-full p-3 xl:pe-6"
    >
      <div class="text-foreground relative flex items-center justify-center transition-[width]">
        <Icon :name="`ic:${iconType}${tab.icon}`" size="1.6rem" />
        <ClientOnly>
          <span
            v-if="tab.badgeCount && tab.badgeCount > 0"
            class="bg-primary text-foreground border-background absolute -end-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-1 p-0.75 text-xs leading-none"
          >
            {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
          </span>
        </ClientOnly>
      </div>
      <p class="hidden xl:inline-block" :class="isActive ? 'font-bold' : ''">
        {{ $t(`leftsidebar.nav.${tab.label}`) }}
      </p>
    </div>
  </NuxtLink>
</template>
