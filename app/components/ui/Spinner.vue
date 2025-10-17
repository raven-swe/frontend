<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Loader2Icon } from 'lucide-vue-next';
import { cn } from '@/utils/index';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<!-- for API https://www.shadcn-vue.com/docs/components/spinner.html#spinner -->
<template>
  <Loader2Icon
    role="status"
    :aria-label="$t('ui.loading')"
    :class="cn('size-4 animate-spin', props.class)"
  />
</template>
