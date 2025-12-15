<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  placeholder?: string;
  maxHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  maxHeight: '70vh',
});

const placeholderText = computed(
  () => props.placeholder || $t('ui.search.search-list.placeholder'),
);
</script>

<template>
  <div
    class="shadow-accent bg-background mt-0 overflow-y-auto rounded-lg border border-1 shadow-md"
    :style="{ maxHeight: props.maxHeight }"
    @mousedown.prevent
  >
    <div v-if="$slots.default">
      <slot />
    </div>
    <div v-else class="text-muted-foreground flex h-24 items-center justify-center text-sm">
      {{ placeholderText }}
    </div>
  </div>
</template>
