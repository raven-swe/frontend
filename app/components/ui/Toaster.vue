<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils';

const toasterVariants = cva(
  'toaster group fixed z-[9999] flex flex-col gap-2 p-4 max-w-sm w-full',
  {
    variants: {
      position: {
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
      },
    },
    defaultVariants: {
      position: 'bottom-right',
    },
  },
);

defineProps<{ position?: keyof (typeof toasterVariants)['variants']['position'] }>();
</script>

<template>
  <Sonner :class="cn(toasterVariants({ position }))" rich-colors close-button />
</template>
