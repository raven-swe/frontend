<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Title',
  },
});
</script>
<template>
  <div class="border-border bg-accent m-2 overflow-hidden rounded-2xl border">
    <h1 class="border-border text-foreground border-b p-3 text-xl font-extrabold">
      {{ props.title }}
    </h1>
    <slot />

    <div class="text-primary hover:bg-foreground/10 cursor-pointer p-3 text-sm">
      {{ $t('rightsidebar.show-more') }}
    </div>
  </div>
</template>
