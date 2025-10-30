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
    <div class="text-foreground flex h-6 w-6 items-center justify-center">
      <Icon :name="`ic:${iconType}${tab.icon}`" size="24" />
    </div>

    <div class="ms-3 hidden text-xl xl:block" :class="textStyle">
      {{ $t(`leftsidebar.nav.${tab.label}`) }}
    </div>
  </NuxtLink>
</template>
