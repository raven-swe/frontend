<template>
  <NuxtLink
    :to="route"
    class="text-muted-foreground hover:bg-accent relative flex h-[53px] items-center justify-center px-4 text-[15px] font-medium transition-colors"
    :class="{
      'text-foreground font-bold': isActive,
      'after:bg-primary after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[4px] after:rounded-full':
        isActive,
    }"
  >
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  route: string;
  isActive: boolean;
}>();
</script>
