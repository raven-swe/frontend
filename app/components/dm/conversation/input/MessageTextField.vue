<script lang="ts" setup>
const { modelValue } = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'enter'): void }>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function resize() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  const maxHeight = 160;
  const newHeight = Math.min(el.scrollHeight, maxHeight);
  el.style.height = newHeight + 'px';
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

watch(
  () => modelValue,
  () => nextTick(resize),
);
onMounted(resize);

function onInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value;
  emit('update:modelValue', value);
  resize();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    emit('enter');
  }
}
</script>
<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    :placeholder="$t ? $t('dm.placeholder-start-message') : 'Start a new message'"
    rows="1"
    class="placeholder:text-muted-foreground/80 flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>
