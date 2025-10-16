<template>
  <div
    class="hover:hover:bg-foreground/10 flex h-[53px] items-center justify-center px-4 text-[15px] transition-colors"
    :class="[isActive ? 'text-foreground font-bold' : 'text-muted-foreground font-medium']"
  >
    <NuxtLink :to="route" class="relative flex h-full items-center">
      {{ label }}
      <div v-if="isActive" class="bg-primary absolute start-0 bottom-0 h-0.5 w-full"></div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    route: string;
    isActive?: boolean;
  }>(),
  {
    isActive: false,
  },
);
</script>
