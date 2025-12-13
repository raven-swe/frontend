<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
  ALLOWED_IMAGE_TYPES_FOR_HTML,
  ALLOWED_VIDEO_TYPES_FOR_HTML,
} from '~/constants/files';
import { showToaster } from '@/utils/showToaster';

interface Props {
  disabled?: boolean;
  characterCount?: number;
  maxLength?: number;
  isOverLimit?: boolean;
  hasMedia?: boolean;
  canAddMedia?: boolean;
  buttonText?: string;
  composerType: string;
}

interface Emits {
  (e: 'post'): void;
  (e: 'add-media', files: File[]): void;
  (e: 'insert-emoji', emoji: string): void;
  (e: 'insert-gif', payload: { tenorId: string; url: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  characterCount: 0,
  maxLength: 280,
  isOverLimit: false,
  hasMedia: false,
  canAddMedia: true,
  buttonText: 'Post',
});

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isEmojiOpen = ref(false);
const isGifPickerOpen = ref(false);

const progress = computed(() => Math.min(props.characterCount / props.maxLength, 1));
const circumference = 2 * Math.PI * 10; // radius = 10
const strokeDasharray = computed(() => circumference);
const strokeDashoffset = computed(() => circumference * (1 - progress.value));

const progressColor = computed(() => {
  if (props.isOverLimit) return '#ef4444'; // red-500
  if (progress.value > 0.9) return '#f59e0b'; // amber-500
  return '#1d9bf0';
});

const showCounter = computed(() => props.characterCount > props.maxLength * 0.85);
const remainingChars = computed(() => props.maxLength - props.characterCount);

const handleMediaClick = () => {
  if (props.canAddMedia) {
    fileInputRef.value?.click();
  }
};

const handleGifClick = () => {
  isGifPickerOpen.value = true;
};

const handleGifSelect = (payload: { tenorId: string; url: string }) => {
  isGifPickerOpen.value = false;
  emit('insert-gif', payload);
};

const handleGifPickerClose = () => {
  isGifPickerOpen.value = false;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  // filter valid files based on size
  const validFiles: File[] = [];

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showToaster(
          'warning',
          $t('tweet.composer.upload-limit-image', { file: file.name, size: MAX_IMAGE_SIZE_MB }),
        );
        continue; // Skip this file
      }
    } else if (file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        showToaster(
          'warning',
          $t('tweet.composer.upload-limit-video', { file: file.name, size: MAX_VIDEO_SIZE_MB }),
        );
        continue; // Skip this file
      }
    }

    validFiles.push(file);
  }

  if (validFiles.length > 0) {
    emit('add-media', validFiles);
  }

  // Reset input
  if (target) {
    target.value = '';
  }
};

interface EmojiSelectEvent {
  emoji: string;
  label: string;
}

const handleEmojiSelect = (emoji: EmojiSelectEvent) => {
  isEmojiOpen.value = false;
  emit('insert-emoji', emoji.emoji);
};
</script>

<template>
  <div
    class="toolbar border-border me-4 flex items-center justify-between pt-1.5"
    :class="props.composerType === 'quote' ? 'ms-0' : 'ms-[60px]'"
  >
    <div class="flex gap-2">
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.media')"
        class="media-btn text-brand-blue"
        size="icon-md"
        :disabled="!canAddMedia"
        @click="handleMediaClick"
      >
        <Icon name="heroicons:photo" size="20" />
      </UiButton>
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.gif')"
        class="text-brand-blue"
        size="icon-md"
        :disabled="!canAddMedia"
        @click="handleGifClick"
      >
        <Icon name="heroicons:gif-solid" size="20" />
      </UiButton>
      <!--  -->
      <UiPopover v-model:open="isEmojiOpen">
        <UiPopoverTrigger as-child>
          <UiButton
            variant="tweet-icon-blue"
            :title="$t('tweet.composer.emoji')"
            class="text-brand-blue"
            size="icon-md"
          >
            <Icon name="heroicons:face-smile" size="20" />
          </UiButton>
        </UiPopoverTrigger>
        <UiPopoverContent class="w-fit rounded-xl p-0">
          <UiEmojiPicker
            class="bg-background h-[342px] border-none! shadow-none!"
            @emoji-select="handleEmojiSelect"
          >
            <UiEmojiPickerSearch />
            <UiEmojiPickerContent />
            <UiEmojiPickerFooter />
          </UiEmojiPicker>
        </UiPopoverContent>
      </UiPopover>

      <!--  -->
    </div>

    <div class="flex items-center gap-3">
      <!-- Character count progress indicator -->
      <div v-if="characterCount > 0" class="flex items-center gap-2">
        <!-- Show remaining count when close to/over limit -->
        <span
          v-if="showCounter"
          class="text-sm font-medium"
          :class="isOverLimit ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ remainingChars }}
        </span>
        <div
          v-if="showCounter"
          class="separator bg-muted-foreground mx-2 h-6 w-px"
          aria-hidden="true"
        ></div>

        <div class="relative">
          <svg class="h-6 w-6 -rotate-90 transform">
            <!-- Background circle -->
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              class="text-gray-200"
            />
            <!-- Progress circle -->
            <circle
              cx="12"
              cy="12"
              r="10"
              :stroke="progressColor"
              stroke-width="2"
              fill="none"
              :stroke-dasharray="strokeDasharray"
              :stroke-dashoffset="strokeDashoffset"
              class="transition-all duration-200"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>

      <UiButton
        class="post-button"
        size="md"
        :disabled="disabled || isOverLimit"
        @click="$emit('post')"
      >
        {{ props.buttonText }}
      </UiButton>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="ALLOWED_IMAGE_TYPES_FOR_HTML + ',' + ALLOWED_VIDEO_TYPES_FOR_HTML"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- GIF Picker -->
    <TweetComposerGifPicker
      v-if="isGifPickerOpen"
      @close="handleGifPickerClose"
      @select="handleGifSelect"
    />
  </div>
</template>
