<script setup lang="ts">
interface Props {
  category: {
    label: string;
  };
}

const props = defineProps<Props>();
</script>

<template>
  <div
    v-bind="$attrs"
    class="bg-background text-muted-foreground sticky z-500 px-3 pt-3.5 pb-2 text-xs leading-none"
    data-slot="emoji-picker-category-header"
  >
    {{ props.category.label }}
  </div>
</template>
