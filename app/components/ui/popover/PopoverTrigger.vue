<script setup lang="ts">
import type { PopoverTriggerProps } from 'reka-ui';
import { PopoverTrigger } from 'reka-ui';

const props = defineProps<PopoverTriggerProps>();
</script>

<template>
  <ClientOnly>
    <PopoverTrigger v-bind="props">
      <slot />
    </PopoverTrigger>
  </ClientOnly>
</template>
