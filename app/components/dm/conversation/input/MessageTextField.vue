<script lang="ts" setup>
const { modelValue } = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'enter'): void }>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    emit('enter');
  }
}
</script>
<template>
  <input
    type="text"
    :value="modelValue"
    :placeholder="$t ? $t('dm.placeholder-start-message') : 'Start a new message'"
    class="placeholder:text-muted-foreground/80 flex-1 bg-transparent text-[15px] outline-none"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @keydown="onKeydown"
  />
</template>
