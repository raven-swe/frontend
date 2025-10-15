<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { AvatarRoot, AvatarFallback } from 'reka-ui';
import AvatarImg from './AvatarImg.vue';

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
  img: '/default_profile.png',
});
</script>

<template>
  <AvatarRoot :class="avatarRoot({ variant, size })">
    <AvatarImg :src="img" alt="User Avatar" />
    <AvatarFallback
      class="flex size-full items-center justify-center rounded-full bg-gray-200 text-gray-600"
    >
      ?
    </AvatarFallback>
  </AvatarRoot>
</template>

<style scoped></style>
