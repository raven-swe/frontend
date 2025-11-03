<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  maxLength: 280,
});

const emit = defineEmits<Emits>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const characterCount = computed(() => props.modelValue.length);
const isOverLimit = computed(() => characterCount.value > props.maxLength);

// Split text into valid and over-limit parts
const validText = computed(() =>
  isOverLimit.value ? props.modelValue.slice(0, props.maxLength) : props.modelValue,
);
const overLimitText = computed(() =>
  isOverLimit.value ? props.modelValue.slice(props.maxLength) : '',
);

// Parse text and highlight hashtags and mentions
const parseText = (text: string) => {
  // Match hashtags and mentions: word characters after # or @
  const regex = /(#\w+|@\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), type: 'normal' });
    }
    // Add the matched hashtag or mention
    parts.push({ text: match[0], type: 'highlight' });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), type: 'normal' });
  }

  return parts;
};

const highlightedValidText = computed(() => parseText(validText.value));

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

const handleInput = (event: Event) => {
  adjustHeight();
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

defineExpose({
  resetHeight: () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  },
  isOverLimit: () => isOverLimit.value,
  characterCount: () => characterCount.value,
});
</script>

<template>
  <div class="max-h-[70vh] min-w-0 flex-1 overflow-y-auto pt-1.5">
    <div class="relative">
      <!-- Hidden textarea for input handling -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        class="absolute inset-0 z-10 w-full resize-none border-none bg-transparent text-xl leading-7 text-transparent caret-black outline-none"
        rows="1"
        @input="handleInput"
      />

      <!-- Visible content with styling -->
      <div
        class="text-foreground min-h-[35px] w-full text-xl leading-7 break-words whitespace-pre-wrap"
        :class="{ 'empty-placeholder': !modelValue }"
      >
        <span v-if="!modelValue" class="text-muted-foreground">{{ placeholder }}</span>
        <span v-else>
          <template v-for="(part, index) in highlightedValidText" :key="index">
            <span v-if="part.type === 'normal'">{{ part.text }}</span>
            <span v-else class="text-primary">{{ part.text }}</span>
          </template>
          <span v-if="overLimitText" class="bg-destructive/50">{{ overLimitText }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
