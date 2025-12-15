<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  isFocused?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'update:isFocused', value: boolean): void;
  (e: 'submit'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  isFocused: false,
});

const emit = defineEmits<Emits>();
const isFocused = ref(props.isFocused);
const inputRef = ref<HTMLInputElement | null>(null);

const placeholderText = computed(() => props.placeholder || $t('ui.search.searchbar.placeholder'));

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleFocus() {
  isFocused.value = true;
  emit('update:isFocused', true);
}

function handleBlur() {
  isFocused.value = false;
  emit('update:isFocused', false);
}

function clearInput() {
  emit('update:modelValue', '');
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <div
    :class="[
      'relative mb-0 flex w-full items-center gap-1 rounded-full border border-2 px-4 py-3',
      isFocused ? 'border-primary shadow-accent shadow-md' : '',
    ]"
  >
    <Icon size="1.3rem" name="ic:outline-search" class="text-muted-foreground" />
    <input
      ref="inputRef"
      :value="modelValue || ''"
      type="text"
      :placeholder="placeholderText"
      class="flex-1 border-none bg-transparent outline-none"
      data-cy="search-input"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleSubmit"
    />
    <UiButton
      v-if="modelValue"
      variant="ghost-default"
      size="icon-xs"
      data-cy="search-clear-button"
      @click="
        emit('update:modelValue', '');
        isFocused = true;
      "
    >
      <Icon
        v-if="modelValue"
        size="1rem"
        name="zondicons:close-solid"
        @mousedown.prevent="clearInput"
      />
    </UiButton>
  </div>
</template>
