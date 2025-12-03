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

const { orientation, canScrollPrev, scrollPrev } = useCarousel();
</script>

<template>
  <UiButton
    data-slot="carousel-previous"
    :disabled="!canScrollPrev"
    :class="
      cn(
        'absolute size-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -left-12 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        props.class,
      )
    "
    :variant="variant"
    :size="size"
    @click="scrollPrev"
  >
    <slot>
      <Icon :name="$t('ui.carousel.previous.icon')" class="size-5" size="1.25rem" />
      <span class="sr-only">{{ $t('ui.carousel.previous.label') }}</span>
    </slot>
  </UiButton>
</template>
