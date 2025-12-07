<script lang="ts" setup>
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
</script>

<template>
  <NuxtLink
    :to="tab.route"
    class="text-foreground hover:bg-foreground/10 flex items-center justify-start rounded-full p-3 xl:w-auto"
  >
    <div class="text-foreground relative flex h-6 w-6 items-center justify-center">
      <Icon :name="`ic:${iconType}${tab.icon}`" size="24" />
      <span
        v-if="tab.badgeCount && tab.badgeCount > 0"
        class="bg-primary text-primary-foreground absolute -top-2 -me-2 block min-w-4 rounded-full px-1 text-center text-[10px] leading-4"
      >
        {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
      </span>
    </div>

    <div class="ms-3 hidden text-xl xl:block" :class="textStyle">
      {{ $t(`leftsidebar.nav.${tab.label}`) }}
    </div>
  </NuxtLink>
</template>
