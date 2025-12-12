<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToaster } from '@/utils/showToaster';
import { useDebounceFn } from '@vueuse/core';
import { searchService } from '~/services/search/searchService';
import type { CompactUser } from '~~/shared/types/user';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
} from '~/constants/files';

interface Props {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'paste-media', files: File[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  maxLength: 280,
});

const emit = defineEmits<Emits>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const mentionResults = ref<CompactUser[] | null>(null);
const mention = ref<string>('');
const highlightedIndex = ref<number>(0);
const isFocused = ref<boolean>(false);

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
  // Match hashtags, mentions & links
  const regex = /(?:^|\s)(https?:\/\/[^\s]+|www\.[^\s]+|#\w+|@\w+)/g;
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
  const newValue = target.value;
  const cursorPosition = target.selectionStart || 0;

  emit('update:modelValue', newValue);

  const textBeforeCursor = newValue.slice(0, cursorPosition);
  const textAfterCursor = newValue.slice(cursorPosition);

  // Primary case: we're actively typing or cursor is inside a potential mention ending with @word
  const activeMentionMatch = textBeforeCursor.match(/@(\w*)$/);
  const textAfter = textAfterCursor.match(/^(\w*)/)?.[1] ?? '';

  if (activeMentionMatch) {
    mention.value = activeMentionMatch[1] + textAfter;
    debouncedMentions(mention.value);
    return;
  }

  // Fallback case: cursor is inside an existing completed mention like "Hello @grok how are you" with cursor on "rok"
  const leftPart = textBeforeCursor.match(/@(\w+)$/);
  const rightPart = textAfterCursor.match(/^(\w*)/)?.[1] ?? '';

  if (leftPart && rightPart.length > 0) {
    mention.value = leftPart[1] + rightPart;
    debouncedMentions(mention.value);
    return;
  }

  // Not in a mention anymore
  if (mention.value) {
    mention.value = '';
    mentionResults.value = null;
  }
};

watch(mentionResults, (newResults) => {
  if (newResults && newResults.length > 0) {
    highlightedIndex.value = 0;
  } else {
    highlightedIndex.value = -1;
  }
});

watch(highlightedIndex, () => {
  if (mentionResults.value && mentionResults.value.length > 0) {
    nextTick(() => {
      const listItems = document.querySelectorAll('.mention-items');
      const activeItem = listItems[highlightedIndex.value] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });
  }
});

const handleKeydown = (e: KeyboardEvent) => {
  if (!mentionResults.value || mentionResults.value.length === 0) return;

  const key = e.key;

  if (key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value + 1) % mentionResults.value.length;
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value =
      (highlightedIndex.value - 1 + mentionResults.value.length) % mentionResults.value.length;
  } else if (key === 'Enter') {
    if (highlightedIndex.value >= 0) {
      e.preventDefault();
      selectUser(mentionResults.value[highlightedIndex.value]);
    }
  }
};

const selectUser = (user: CompactUser) => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const currentText = props.modelValue;
  const cursorPos = textarea.selectionStart || 0;

  const textBeforeCursor = currentText.slice(0, cursorPos);
  const textAfterCursor = currentText.slice(cursorPos);

  // Detect the current mention being edited (left and right parts around cursor)
  const leftMatch = textBeforeCursor.match(/@(\w*)$/); // part before cursor after @
  const rightMatch = textAfterCursor.match(/^(\w*)/); // part after cursor

  let startIndex: number;
  let endIndex: number;

  if (leftMatch) {
    // There is text after @ before the cursor → we are inside or at end of a mention
    startIndex = textBeforeCursor.lastIndexOf('@');
    const usernameSoFar = leftMatch[1] + (rightMatch?.[1] ?? '');
    endIndex = startIndex + 1 + usernameSoFar.length; // +1 for the @
  } else {
    // Fallback — should not happen if dropdown is open
    startIndex = cursorPos;
    endIndex = cursorPos;
  }

  // Replace the entire current mention with the selected one + space
  const newText =
    currentText.slice(0, startIndex) + '@' + user.username + ' ' + currentText.slice(endIndex);

  emit('update:modelValue', newText);

  closeMentionDropdown();

  // Place cursor after the inserted username and space
  nextTick(() => {
    textarea.focus();
    const newCursorPos = startIndex + user.username.length + 2; // +1 for @, +1 for space
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
};

const closeMentionDropdown = () => {
  mentionResults.value = null;
  mention.value = '';
  highlightedIndex.value = -1;
};

const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  const files: File[] = [];

  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (!file) continue;

      if (allowedTypes.includes(file.type)) {
        if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE_BYTES) {
          showToaster(
            'warning',
            $t('tweet.composer.upload-limit-image', { file: file.name, size: MAX_IMAGE_SIZE_MB }),
          );
          continue; // Skip this file
        } else if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE_BYTES) {
          showToaster(
            'warning',
            $t('tweet.composer.upload-limit-video', { file: file.name, size: MAX_VIDEO_SIZE_MB }),
          );
          continue; // Skip this file
        }
        files.push(file);
      } else {
        showToaster(
          'error',
          $t('errors.UNSUPPORTED-IMAGE-TYPE', {
            types: allowedTypes.map((t) => t.split('/')[1]).join(', '),
          }) as string,
        );
      }

      if (files.length >= 4) break;
    }
  }

  // Only prevent default and emit if we have files to add
  if (files.length > 0) {
    e.preventDefault(); // Prevent text insertion of the image name
    emit('paste-media', files);
  }
};

// Get root DOM element of this component
const vm = getCurrentInstance();

onMounted(() => {
  const root = vm?.proxy?.$el as HTMLElement;
  root?.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  const root = vm?.proxy?.$el as HTMLElement;
  root?.removeEventListener('paste', handlePaste);
});

defineExpose({
  resetHeight: () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  },
  isOverLimit: () => isOverLimit.value,
  characterCount: () => characterCount.value,
});

const debouncedMentions = useDebounceFn(async (mention) => {
  if (!mention.trim()) {
    mentionResults.value = null;
    return;
  }
  try {
    const results = await searchService.getMentionSuggestions(mention);
    mentionResults.value = results.data;
  } catch (error) {
    console.error('Mention search error:', error);
    mentionResults.value = null;
  }
}, 300);
</script>

<template>
  <div class="max-h-[70vh] min-w-0 flex-1 overflow-y-auto pt-1.5">
    <div class="relative">
      <!-- Hidden textarea for input handling -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        class="caret-foreground absolute inset-0 z-10 w-full resize-none border-none bg-transparent text-lg leading-7 text-transparent outline-none"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Visible content with styling -->
      <div
        class="text-foreground min-h-[35px] w-full text-lg leading-7 break-words whitespace-pre-wrap"
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
    <slot name="reposted-tweet" />
    <div
      v-if="mentionResults && mentionResults.length > 0 && isFocused"
      class="absolute start-15 z-50 mt-2 w-90"
    >
      <UiSearchList :max-height="'50vh'">
        <div
          v-for="(user, index) in mentionResults"
          :key="user.username"
          :class="[
            'mention-items flex cursor-pointer items-center gap-3 p-3 transition-colors',
            highlightedIndex === index ? 'bg-accent' : '',
          ]"
          @click="selectUser(user)"
        >
          <UiAvatar :img="user.avatarUrl" size="sm" />
          <div class="flex-1 overflow-hidden">
            <p class="text-foreground truncate text-sm font-bold">{{ user.displayName }}</p>
            <p class="text-muted-foreground truncate text-sm">{{ $t('@') }}{{ user.username }}</p>
            <p
              v-if="user.relationship.follower || user.relationship.following"
              class="text-muted-foreground truncate text-sm"
            >
              <Icon name="material-symbols:person" />
              {{
                user.relationship.follower && user.relationship.following
                  ? $t('ui.you-follow-each-other')
                  : user.relationship.follower
                    ? $t('ui.follow-you')
                    : user.relationship.following
                      ? $t('ui.following')
                      : ''
              }}
            </p>
          </div>
        </div>
      </UiSearchList>
    </div>
  </div>
</template>
