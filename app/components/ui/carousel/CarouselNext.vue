<script setup lang="ts">
import type { WithClassAsProps } from './interface';
import { cn } from '@/utils';
import { useCarousel } from './useCarousel';
import type { ButtonVariants } from '~/components/ui/Button.vue';

const props = withDefaults(
  defineProps<
    {
      variant?: ButtonVariants['variant'];
      size?: ButtonVariants['size'];
    } & WithClassAsProps
  >(),
  {
    variant: 'outline',
    size: 'icon-xs',
  },
);

const { orientation, canScrollNext, scrollNext } = useCarousel();
</script>

<template>
  <UiButton
    data-slot="carousel-next"
    :disabled="!canScrollNext"
    :class="
      cn(
        'absolute size-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -right-12 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        props.class,
      )
    "
    :variant="variant"
    :size="size"
    @click="scrollNext"
  >
    <slot>
      <Icon :name="$t('ui.carousel.next.icon')" class="size-5" size="1.25rem" />
      <span class="sr-only">{{ $t('ui.carousel.next.label') }}</span>
    </slot>
  </UiButton>
</template>
