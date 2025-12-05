<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MediaItem } from '~~/shared/types/shared';

interface Props {
  media?: MediaItem[];
  composerType?: string;
}

interface Emits {
  (e: 'remove', id: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  media: () => [],
  composerType: 'default',
});

const emit = defineEmits<Emits>();

const currentIndex = ref(0);

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
  <div
    v-if="media.length > 0"
    class="relative mb-3"
    :class="props.composerType === 'quote' ? 'ms-0' : 'ms-[60px]'"
  >
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
          class="bg-background/50 relative aspect-[25/28] flex-shrink-0 overflow-hidden"
          :style="{ width: itemWidth }"
        >
          <component
            :is="item.type === 'video' ? 'video' : 'img'"
            :src="item.url"
            class="h-full w-full object-cover"
            v-bind="item.type === 'video' ? { controls: true } : {}"
          />

          <UiButton
            type="button"
            variant="ghost-default"
            size="icon-sm"
            class="bg-foreground/75 hover:bg-foreground/90 absolute start-2 top-2 z-10"
            @click="removeMedia(item.id)"
          >
            <Icon name="heroicons:x-mark" size="16" class="text-background" />
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
        class="bg-foreground/75 hover:bg-foreground/98 absolute start-2 top-1/2 z-10 -translate-y-1/2"
        @click="navigateLeft"
      >
        <Icon name="heroicons:chevron-left" size="20" class="text-background" />
      </UiButton>

      <UiButton
        v-if="canNavigateRight"
        type="button"
        variant="ghost-default"
        size="icon-md"
        class="bg-foreground/75 hover:bg-foreground/98 absolute end-2 top-1/2 z-10 -translate-y-1/2"
        @click="navigateRight"
      >
        <Icon name="heroicons:chevron-right" size="20" class="text-background" />
      </UiButton>
    </template>
  </div>
</template>
