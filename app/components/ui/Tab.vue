<template>
  <NuxtLink
    :to="route"
    class="hover:bg-foreground/10 relative flex h-[53px] cursor-pointer items-center justify-center px-4 text-[15px] transition-colors"
    :class="[isActive ? 'text-foreground font-bold' : 'text-muted-foreground font-medium']"
    aria-role="tab"
  >
    <span class="relative flex flex-col items-center">
      {{ label }}
      <div v-if="isActive" class="bg-primary absolute -bottom-[15px] h-1 w-full rounded-full"></div>
    </span>
  </NuxtLink>
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
