<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
  to: string;
  icon?: string;
}>();
</script>
<template>
  <NuxtLink
    class="hover:bg-accent flex cursor-pointer items-center justify-between px-4 py-3 transition-colors"
    :to="props.to"
  >
    <div class="flex items-center gap-3">
      <Icon v-if="props.icon" :name="props.icon" size="1.2rem" class="text-muted-foreground px-6" />
      <div class="flex flex-col">
        <span class="text-lg leading-tight font-medium">{{ props.title }}</span>
        <span v-if="props.subtitle" class="text-md text-muted-foreground leading-tight">
          {{ props.subtitle }}
        </span>
      </div>
    </div>
    <Icon :name="$t('setting.item-icon')" size="1.2rem" class="text-muted-foreground" />
  </NuxtLink>
</template>
