<script setup lang="ts" generic="T">
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/vue-virtual';

interface Props<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  scrollMargin?: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  getKey?: (
    item: T,
    index: number,
    key?: VirtualItem['key'],
  ) => string | number | VirtualItem['key'];
}

const props = withDefaults(defineProps<Props<T>>(), {
  estimateSize: 120,
  overscan: 2,
  scrollMargin: 0,
  getKey: (item: T, index: number, key?: VirtualItem['key']) => key ?? index,
});

// Refs for container offset
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
});

// Virtualizer options
const virtualizerOptions = computed(() => ({
  count: props.hasNextPage ? props.items.length + 1 : props.items.length,
  estimateSize: () => props.estimateSize,
  overscan: props.overscan,
  scrollMargin: props.scrollMargin || parentOffsetRef.value,
}));

// Virtualizer
const virtualizer = useWindowVirtualizer(virtualizerOptions);
const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

// Measure DOM rows
const measureElement = (el: Element | ComponentPublicInstance | null) => {
  if (!el) return;
  const element = 'nodeType' in el ? el : el.$el;
  virtualizer.value.measureElement(element);
};

// Infinite scrolling trigger
watchEffect(() => {
  const last = [...virtualRows.value].reverse()[0];
  if (!last) return;

  const nearingEnd = last.index >= props.items.length - 3;

  if (nearingEnd && props.hasNextPage && !props.isFetchingNextPage) {
    props.fetchNextPage();
  }
});
</script>

<template>
  <div ref="parentRef">
    <div
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${
            virtualRows[0] ? virtualRows[0].start - virtualizer.options.scrollMargin : 0
          }px)`,
        }"
      >
        <div
          v-for="virtualRow in virtualRows"
          :key="
            String(props.getKey(props.items[virtualRow.index]!, virtualRow.index, virtualRow.key))
          "
          :ref="measureElement"
          :data-index="virtualRow.index"
        >
          <slot name="item" :item="props.items[virtualRow.index]" :index="virtualRow.index" />
        </div>
      </div>
    </div>
  </div>
</template>
