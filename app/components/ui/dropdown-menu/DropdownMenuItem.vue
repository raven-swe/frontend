<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuItem, useForwardProps } from 'reka-ui';
import { cn } from '@/utils';

const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      class?: HTMLAttributes['class'];
      inset?: boolean;
      variant?: 'default' | 'destructive';
    }
  >(),
  {
    variant: 'default',
    inset: false,
    class: '',
  },
);

const delegatedProps = reactiveOmit(props, 'inset', 'variant', 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="
      cn(
        'bg-background/95 focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*=\'text-\'])]:text-muted-foreground text-md relative flex cursor-default items-center gap-2 p-3 px-4 font-bold outline-hidden select-none hover:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
