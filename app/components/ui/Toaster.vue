<script lang="ts" setup>
import { Toaster as Sonner } from 'vue-sonner';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils';

const toasterVariants = cva(
  'toaster fixed z-[9999] flex flex-col gap-3 p-4 md:p-6 rounded-lg max-w-xs w-auto m-4',
  {
    variants: {
      position: {
        'top-left': 'top-0 left-0',
        'top-center': 'top-0 left-1/2 -translate-x-1/2',
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-0 right-0',
      },
    },
    defaultVariants: {
      position: 'bottom-right',
    },
  },
);

interface Props {
  position?: NonNullable<Parameters<typeof toasterVariants>[0]>['position'];
}

withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
});
</script>

<template>
  <Sonner :class="cn(toasterVariants({ position }))" />
</template>
