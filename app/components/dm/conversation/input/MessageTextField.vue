<script lang="ts" setup>
const { modelValue, disabled = false } = defineProps<{ modelValue: string; disabled?: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'enter'): void }>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const route = useRoute();
const conversationId = computed(() => route.params.conversationId as string | null);
const dmSocket = inject<ReturnType<typeof useDmSocketIO>>('dmSocket');

// Typing indicator logic with debounce
let typingTimeout: ReturnType<typeof setTimeout> | null = null;
const isTyping = ref(false);

function sendTypingStart() {
  if (!dmSocket || !conversationId.value || isTyping.value) return;
  isTyping.value = true;
  dmSocket.typingStart(conversationId.value);
}

function sendTypingStop() {
  if (!dmSocket || !conversationId.value || !isTyping.value) return;
  isTyping.value = false;
  dmSocket.typingStop(conversationId.value);
}

function handleTyping() {
  sendTypingStart();

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Set timeout to stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    sendTypingStop();
  }, 2000);
}

// Cleanup on unmount
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  sendTypingStop();
});

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
  handleTyping();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendTypingStop();
    emit('enter');
  }
}
</script>
<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    :placeholder="$t ? $t('dm.placeholder-start-message') : 'Start a new message'"
    :disabled="disabled"
    rows="1"
    class="placeholder:text-muted-foreground/80 flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50"
    data-cy="dm-message-textfield"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>
