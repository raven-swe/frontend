<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { DmConversation } from '~/../shared/types/dm';

const props = defineProps<{
  conversations: DmConversation[];
  selectedId: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'loadMore'): void;
}>();

const parentRef = ref<HTMLElement | null>(null);

const rowVirtualizerOptions = computed(() => {
  return {
    count: props.hasNextPage ? props.conversations.length + 1 : props.conversations.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => 84,
    overscan: 5,
  };
});

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());

const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

// Fetch next page when scrolling near the end
watch(
  virtualRows,
  (rows) => {
    const lastItem = rows[rows.length - 1];

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= props.conversations.length - 1 &&
      props.hasNextPage &&
      !props.isFetchingNextPage
    ) {
      emit('loadMore');
    }
  },
  { immediate: true },
);
</script>

<template>
  <div ref="parentRef" class="min-h-0 flex-1 overflow-auto">
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
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <template v-if="virtualRow.index > conversations.length - 1">
          <div class="flex items-center justify-center p-4">
            <UiSpinner v-if="hasNextPage" size="1.25rem" />
          </div>
        </template>
        <template v-else-if="conversations[virtualRow.index]">
          <DmConversationItem
            :conversation="conversations[virtualRow.index]!"
            :is-selected="selectedId === conversations[virtualRow.index]!.id"
            class="hover:bg-foreground/5 cursor-pointer"
            @click="emit('select', conversations[virtualRow.index]!.id)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
