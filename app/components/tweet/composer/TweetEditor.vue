<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  modelValue: string;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
});

const emit = defineEmits<Emits>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  adjustHeight();
};

defineExpose({
  resetHeight: () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  },
});
</script>

<template>
  <div class="max-h-[60vh] min-w-0 flex-1 overflow-y-auto pt-1.5">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      class="text-foreground placeholder:text-muted-foreground w-full resize-none border-none bg-transparent text-xl leading-7 outline-none"
      rows="1"
      @input="handleInput"
    />
  </div>
</template>
