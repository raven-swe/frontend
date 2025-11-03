<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  disabled?: boolean;
  characterCount?: number;
  maxLength?: number;
  isOverLimit?: boolean;
  hasMedia?: boolean;
  canAddMedia?: boolean;
}

interface Emits {
  (e: 'post'): void;
  (e: 'add-media', files: File[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  characterCount: 0,
  maxLength: 280,
  isOverLimit: false,
  hasMedia: false,
  canAddMedia: true,
});

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);

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

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (files.length > 0) {
    emit('add-media', files);
  }

  // Reset input
  if (target) {
    target.value = '';
  }
};
</script>

<template>
  <div class="toolbar border-border ms-[60px] flex items-center justify-between border-t pt-1.5">
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
      >
        <Icon name="heroicons:gif-solid" size="20" />
      </UiButton>
      <UiButton
        variant="tweet-icon-blue"
        :title="$t('tweet.composer.emoji')"
        class="text-brand-blue"
        size="icon-md"
      >
        <Icon name="heroicons:face-smile" size="20" />
      </UiButton>
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
        {{ $t('ui.post') }}
      </UiButton>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
