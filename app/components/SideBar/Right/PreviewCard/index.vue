<script lang="ts" setup>
const props = defineProps<{
  title?: string;
}>();
</script>
<template>
  <div class="border-border m-2 overflow-hidden rounded-2xl border">
    <h1
      v-if="props.title"
      class="border-border text-foreground border-b p-3 text-xl font-extrabold"
    >
      {{ props.title }}
    </h1>

    <slot />
  </div>
</template>
