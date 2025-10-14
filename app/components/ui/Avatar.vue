<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';

const avatarRoot = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    variant: {
      default: 'cursor-default',
      primary: 'cursor-pointer hover:brightness-96',
    },
    size: {
      sm: 'size-10',
      md: 'size-16',
      lg: 'size-24',
      xl: 'size-92',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface Props {
  variant?: NonNullable<Parameters<typeof avatarRoot>[0]>['variant'];
  size?: NonNullable<Parameters<typeof avatarRoot>[0]>['size'];
  img?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  img: 'https://placehold.co/100x100',
});
</script>

<template>
  <AvatarRoot :class="avatarRoot({ variant, size })">
    <AvatarImage class="aspect-square size-full" :src="img" alt="User Avatar" />
    <AvatarFallback class="bg-muted flex size-full items-center justify-center rounded-full" />
  </AvatarRoot>
</template>

<style scoped></style>
