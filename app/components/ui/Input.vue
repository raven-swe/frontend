<script setup lang="ts">
import { ref, type HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
const focused = ref(false);
</script>

<template>
  <div class="relative w-fit" :class="props.class">
    <input
      v-model="modelValue"
      :class="
        cn(
          'peer file:text-foreground border-muted-foreground/60 w-full min-w-0 rounded-md border bg-transparent px-2 pt-5.5 pb-2 text-base transition-[color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-[1px]',
          'aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive',
        )
      "
      v-bind="$attrs"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span
      :class="
        cn(
          'text-muted-foreground origin-start pointer-events-none absolute transition-all duration-200 ease-out',
          {
            'start-2 top-1.5 text-xs': focused || modelValue,
            'text-muted-foreground start-2 top-1/2 -translate-y-1/2 text-lg': !(
              focused || modelValue
            ),
            'text-primary peer-[aria-invalid]:text-destructive': focused,
          },
        )
      "
      >{{ $attrs.placeholder }}</span
    >
  </div>
</template>

<style scoped>
input::placeholder {
  color: transparent;
}
</style>
