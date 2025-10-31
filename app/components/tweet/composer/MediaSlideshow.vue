<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MediaItem } from '~~/shared/types/shared';

interface Props {
  media?: MediaItem[];
}

interface Emits {
  (e: 'remove', id: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  media: () => [],
});

const emit = defineEmits<Emits>();

const currentIndex = ref(0);
// const fileInputRef = ref<HTMLInputElement | null>(null);

const hasMultipleMedia = computed(() => props.media.length > 1);
const canNavigateLeft = computed(() => currentIndex.value > 0);

// Allow navigation until we can't show more items
const canNavigateRight = computed(() => {
  if (props.media.length <= 2) return false;
  return currentIndex.value < props.media.length - 2;
});

const translateX = computed(() => {
  return -(currentIndex.value * 45); // 45% accounts for width + gap
});

// Calculate item width based on media count
const itemWidth = computed(() => {
  return props.media.length === 1 ? '100%' : '43%';
});

const navigateLeft = () => {
  if (!canNavigateLeft.value) return;
  currentIndex.value = Math.max(0, currentIndex.value - 1);
};

const navigateRight = () => {
  if (!canNavigateRight.value) return;
  currentIndex.value++;
};

const removeMedia = (id: string) => {
  const removingIndex = props.media.findIndex((m) => m.id === id);

  emit('remove', id);

  // Adjust current index after removal
  if (removingIndex < currentIndex.value) {
    currentIndex.value--;
  } else if (currentIndex.value >= props.media.length - 2 && currentIndex.value > 0) {
    currentIndex.value--;
  }

  // Reset to 0 if no media left or index is invalid
  if (props.media.length <= 2 || currentIndex.value < 0) {
    currentIndex.value = 0;
  }
};
</script>

<template>
  <div v-if="media.length > 0" class="relative ms-[60px] mb-3">
    <!-- Carousel Container -->
    <div class="border-border overflow-hidden rounded-2xl border">
      <!-- Sliding Track -->
      <div
        class="flex gap-2 transition-transform duration-300 ease-out"
        :style="{
          transform: `translateX(${translateX}%)`,
        }"
      >
        <div
          v-for="item in media"
          :key="item.id"
          class="relative aspect-[25/28] flex-shrink-0 overflow-hidden bg-gray-100"
          :style="{ width: itemWidth }"
        >
          <!-- Media Item -->
          <img :src="item.url" class="h-full w-full object-cover" />
          <UiButton
            type="button"
            variant="ghost-default"
            size="icon-sm"
            class="absolute start-2 top-2 z-10 bg-black/75 hover:bg-black/90"
            @click="removeMedia(item.id)"
          >
            <Icon name="heroicons:x-mark" size="16" class="text-white" />
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <template v-if="hasMultipleMedia">
      <UiButton
        v-if="canNavigateLeft"
        type="button"
        variant="ghost-default"
        size="icon-md"
        class="absolute start-2 top-1/2 z-10 -translate-y-1/2 bg-black/75 hover:bg-black/98"
        @click="navigateLeft"
      >
        <Icon name="heroicons:chevron-left" size="20" class="text-white" />
      </UiButton>

      <UiButton
        v-if="canNavigateRight"
        type="button"
        variant="ghost-default"
        size="icon-md"
        class="absolute end-2 top-1/2 z-10 -translate-y-1/2 bg-black/75 hover:bg-black/98"
        @click="navigateRight"
      >
        <Icon name="heroicons:chevron-right" size="20" class="text-white" />
      </UiButton>
    </template>
  </div>
</template>
