<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/utils';
import DialogOverlay from './DialogOverlay.vue';
import Button from '@/components/ui/Button.vue';

const props = defineProps<
  DialogContentProps & {
    class?: HTMLAttributes['class'];
    headerClass?: HTMLAttributes['class'];
    hideCloseButton?: boolean;
  }
>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'headerClass');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="forwarded"
      :class="
        cn(
          'bg-background focus-visible:ring-ring data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex h-full max-h-[calc(100vh-3rem)] w-full translate-x-[-50%] translate-y-[-50%] flex-col border shadow-lg outline-0 duration-200 sm:h-160 sm:max-w-xl sm:rounded-2xl',
          props.class,
        )
      "
      @escape-key-down="(e) => e.preventDefault()"
      @interact-outside="(e) => e.preventDefault()"
    >
      <div class="relative flex h-13 flex-row items-center justify-start gap-2 p-2">
        <DialogClose v-if="!hideCloseButton" data-slot="dialog-close" as-child>
          <Button variant="ghost-default" size="icon-xs" class="absolute inset-2">
            <Icon name="lucide:x" class="size-5" />
            <span class="sr-only">{{ $t('ui.close') }}</span>
          </Button>
        </DialogClose>
        <div
          :class="cn('flex h-8 w-full items-center ps-10 text-lg font-medium', props.headerClass)"
        >
          <slot name="header" />
        </div>
      </div>

      <div class="flex h-full w-full flex-col gap-4 px-6 pb-6">
        <slot />
      </div>
    </DialogContent>
  </DialogPortal>
</template>
