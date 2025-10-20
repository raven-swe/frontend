<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
  placeholder: string;
  options: Array<{ value: string | number; label: string }>;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <div
    class="group border-muted-foreground/60 relative block rounded-md border bg-transparent pt-4 text-base transition-[color]"
    :class="
      cn(
        'has-[select[aria-invalid=true]]:ring-destructive has-[select[aria-invalid=true]]:border-destructive',
        'has-[select:focus-visible]:border-primary has-[select:focus-visible]:ring-primary has-[select:focus-visible]:ring-[1px]',
        props.class,
      )
    "
  >
    <select
      ref="select-ref"
      v-model="modelValue"
      v-bind="$attrs"
      class="peer w-full min-w-0 appearance-none p-2 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span
      :class="
        cn(
          'text-muted-foreground origin-start peer-[input[aria-invalid=true]]:text-destructive pointer-events-none absolute start-2 top-1.5 text-xs transition-all duration-200 ease-out',
          'peer-focus:text-primary',
          'peer-[select[aria-invalid=true]]:text-destructive',
        )
      "
      >{{ props.placeholder }}</span
    >
    <Icon
      name="lucide:chevron-down"
      class="text-muted-foreground peer-focus:text-primary pointer-events-none absolute end-2 top-1/2 size-5 -translate-y-1/2"
    />
  </div>
</template>
