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
    v-show="canScrollPrev"
    data-slot="carousel-previous"
    :class="
      cn(
        'bg-background/60 absolute z-10 size-8 rounded-full shadow',
        orientation === 'horizontal'
          ? 'start-2 top-1/2 -translate-y-1/2'
          : 'start-1/2 -top-12 -translate-x-1/2 rotate-90',
        props.class,
      )
    "
    :variant="variant"
    :size="size"
    @click="scrollPrev"
  >
    <slot>
      <Icon :name="$t('ui.carousel.previous.icon')" class="size-5" size="1.55rem" />
      <span class="sr-only">{{ $t('ui.carousel.previous.label') }}</span>
    </slot>
  </UiButton>
</template>
