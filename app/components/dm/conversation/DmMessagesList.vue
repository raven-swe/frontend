<script lang="ts" setup>
import { computed, watchEffect, watch, ref, onMounted, nextTick } from 'vue';

import type { DmMessage, DmConversation } from '#shared/types/dm';
import DmMessageItem from './DmMessageItem.vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

const props = defineProps<{
  messages: DmMessage[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  lastSeenMessageId?: string | null;
  conversation?: DmConversation | null;
}>();

defineEmits<{
  (e: 'message-deleted', messageId: string): void;
}>();

const parentRef = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  if (rowVirtualizer.value && props.messages.length > 0) {
    rowVirtualizer.value.scrollToIndex(props.messages.length - 1, {
      align: 'end',
      behavior: 'auto',
    });
  }
};

const rowVirtualizerOptions = computed(() => {
  return {
    count: props.messages.length,
    getScrollElement: () => parentRef.value,
    estimateSize: (index: number) => {
      const message = props.messages[index];
      if (message?.mediaUrl) {
        return 320; // Larger estimate for messages with images
      }
      return 80; // Default for text messages
    },
    overscan: 5,
    measureElement: (element: HTMLElement) => {
      // Measure actual element height for accurate positioning
      return element.getBoundingClientRect().height;
    },
  };
});

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const isInitialLoad = ref(true);

// Scroll to bottom on initial load
onMounted(() => {
  // Wait for virtualizer to render and calculate heights
  nextTick(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  });
});

// Watch for initial messages to load and scroll to bottom
watch(
  () => props.messages.length,
  (newLength, oldLength) => {
    if (oldLength > 0 && newLength === 0) {
      isInitialLoad.value = true;
    }

    if (isInitialLoad.value && newLength > 0) {
      // Wait for DOM and virtualizer to update
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
          // Try again after a bit more time to ensure virtualizer has rendered
          setTimeout(() => {
            scrollToBottom();
            isInitialLoad.value = false;
          }, 150);
        }, 100);
      });
    }
  },
);

// Watch totalSize to scroll when virtualizer has calculated all heights
watch(totalSize, (newSize, oldSize) => {
  if (isInitialLoad.value && newSize > 0 && newSize !== oldSize) {
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    });
  }
});

// Trigger load more when scrolling to the top
watchEffect(() => {
  const [firstItem] = virtualRows.value;

  if (!firstItem) return;

  // Load more when the first visible item is at index 0 (top of the list)
  if (firstItem.index === 0 && props.hasNextPage && !props.isFetchingNextPage && props.onLoadMore) {
    props.onLoadMore();
  }
});

// Auto scroll to bottom when new messages arrive only if already near bottom
watch(
  () => props.messages.length,
  (newLength, oldLength) => {
    if (!isInitialLoad.value && newLength > oldLength && parentRef.value) {
      const scrollTop = parentRef.value.scrollTop;
      const scrollHeight = parentRef.value.scrollHeight;
      const clientHeight = parentRef.value.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 200;

      if (isNearBottom) {
        nextTick(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 50);
        });
      }
    }
  },
);

defineExpose({ parentRef, scrollToBottom });
</script>
<template>
  <div ref="parentRef" class="h-full gap-2 overflow-y-auto">
    <DmConversationInfo v-if="conversation" :conversation="conversation" class="pt-4" />

    <div v-if="hasNextPage && isFetchingNextPage" class="flex items-center justify-center p-4">
      <UiSpinner size="1.5rem" />
    </div>

    <div
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :ref="(el) => el && rowVirtualizer.measureElement(el as HTMLElement)"
        :data-index="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <template v-if="messages[virtualRow.index]">
          <DmMessageItem
            :message="messages[virtualRow.index]!"
            :is-seen="messages[virtualRow.index]!.id === props.lastSeenMessageId"
            :conversation-id="conversation?.id || ''"
            @deleted="(messageId) => $emit('message-deleted', messageId)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
