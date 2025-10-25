<script setup lang="ts">
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-md  font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none  focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background hover:bg-foreground/90 focus-visible:bg-foreground/90 focus-visible:ring-ring',
        primary:
          'bg-primary text-background dark:text-foreground hover:bg-primary/90 focus-visible:bg-primary/90 focus-visible:ring-ring-primary',
        outline:
          'border-input border-1 text-foreground bg-background hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-ring',
        'outline-destructive':
          'border-input text-foreground hover:border-destructive border-1 bg-background hover:text-destructive hover:bg-destructive/10 focus-visible:bg-foreground/10 focus-visible:ring-ring',

        'ghost-default':
          'bg-background hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-ring',

        'ghost-primary':
          'hover:text-primary hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-ring-primary text-primary',
        'tweet-icon-blue':
          'hover:bg-brand-blue/10 focus-visible:bg-brand-blue/10 focus-visible:ring-brand-blue',
        'tweet-icon-red':
          'hover:bg-brand-red/10 focus-visible:bg-brand-red/10 focus-visible:ring-brand-red',
        'tweet-icon-turquoise':
          'hover:bg-brand-turquoise/10 focus-visible:bg-brand-turquoise/10 focus-visible:ring-brand-turquoise',
        'tweet-icon-red-active':
          'hover:bg-brand-red/20 text-brand-red focus-visible:bg-brand-red/20 focus-visible:ring-ring-brand-red',
        'tweet-icon-turquoise-active':
          'hover:bg-brand-turquoise/20 text-brand-turquoise focus-visible:bg-brand-turquoise/20 focus-visible:ring-ring-brand-turquoise',
      },
      size: {
        xs: 'h-8 px-4 text-sm has-[>svg]:px-2.5 [&>svg]:size-4',
        sm: 'h-8.5 px-3 text-sm has-[>svg]:px-2.5 [&>svg]:size-4',
        md: 'h-9 px-4 text-md has-[>svg]:px-3 [&>svg]:size-4.5',
        lg: 'h-10 px-4 py-2 text-base has-[>svg]:px-3 [&>svg]:size-5',
        xl: 'h-13 px-5 text-lg has-[>svg]:px-4 [&>svg]:size-5',
        '2xl': 'h-16.25 p-3 text-lg has-[>svg]:px-5 [&>svg]:size-6',
        link: 'p-0 h-auto text-md rounded-sm',

        'icon-xs': 'size-8 flex items-center justify-center [&>svg]:size-4',
        'icon-sm': 'size-8.5 flex items-center justify-center [&>svg]:size-4',
        'icon-md': 'size-9 flex items-center justify-center [&>svg]:size-4.5',
        'icon-lg': 'size-10 flex items-center justify-center [&>svg]:size-5',
        'icon-xl': 'size-13 flex items-center justify-center [&>svg]:size-5',
        'icon-2xl': 'size-16.25 flex items-center justify-center [&>svg]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
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
  size: 'lg',
});
</script>

<template>
  <component :is="as" v-bind="$attrs" :class="buttonVariants({ variant, size })">
    <slot />
  </component>
</template>
