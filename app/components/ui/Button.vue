<script setup lang="ts">
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-md  font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background hover:bg-foreground/90 focus-visible:bg-foreground/90',
        outline:
          'border-input border-1 bg-background hover:bg-foreground/10 focus-visible:bg-foreground/10',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface Props {
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant'];
  size?: NonNullable<Parameters<typeof buttonVariants>[0]>['size'];
  as?: string;
}

withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
});
</script>
<template>
  <component :is="as" v-bind="$attrs" :class="buttonVariants({ variant, size })">
    <slot />
  </component>
</template>
