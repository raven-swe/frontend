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
    v-show="canScrollNext"
    data-slot="carousel-next"
    :class="
      cn(
        'bg-background/60 absolute z-10 size-8 rounded-full shadow',
        orientation === 'horizontal'
          ? 'end-2 top-1/2 -translate-y-1/2'
          : 'start-1/2 -bottom-12 -translate-x-1/2 rotate-90',
        props.class,
      )
    "
    :variant="variant"
    :size="size"
    @click="scrollNext"
  >
    <slot>
      <Icon :name="$t('ui.carousel.next.icon')" class="size-5" size="1.55rem" />
      <span class="sr-only">{{ $t('ui.carousel.next.label') }}</span>
    </slot>
  </UiButton>
</template>
