<script setup lang="ts">
import { ref, type HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
  placeholder: string;
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
  <label
    class="group border-muted-foreground/60 relative block rounded-md border bg-transparent px-2 pt-5.5 pb-2 text-base transition-[color]"
    :class="
      cn(
        'has-[input[aria-invalid=true]]:ring-destructive has-[input[aria-invalid=true]]:border-destructive',
        'has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-primary has-[input:focus-visible]:ring-[1px]',
        props.class,
      )
    "
  >
    <input
      v-model="modelValue"
      class="peer file:text-foreground w-full min-w-0 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      v-bind="$attrs"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span
      :class="
        cn(
          'text-muted-foreground origin-start peer-[input[aria-invalid=true]]:text-destructive pointer-events-none absolute transition-all duration-200 ease-out',
          {
            'start-2 top-1.5 text-xs': focused || modelValue,
            'text-muted-foreground start-2 top-1/2 -translate-y-1/2 text-lg': !(
              focused || modelValue
            ),
            'text-primary': focused,
          },
        )
      "
      >{{ props.placeholder }}</span
    >
  </label>
</template>

<style scoped>
input::placeholder {
  color: transparent;
}
/* style webkit autofill */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px var(--color-input-autofill) inset !important;
  -webkit-text-fill-color: var(--color-foreground) !important;
  color: var(--color-foreground);
}
</style>
