<script setup lang="ts">
import { buttonVariants, type ButtonVariants } from '@/components/ui/button/variants';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
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
