<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
// Local placeholder image to show when there is no media
interface Props {
  media: TweetMedia[] | undefined;
}
const props = defineProps<Props>();
const media = ref(props.media || []);
// const firstImage = computed(() => props.media?.find((m) => m.type === 'IMAGE'));
</script>

<template>
  <div class="w-full pt-2">
    <!-- 0 media: placeholder 2x2 grid -->

    <!-- 1 media -->
    <div v-if="media.length === 1" class="grid overflow-hidden rounded-xl">
      <img src="./image.jpg" class="h-auto w-full object-cover" />
    </div>

    <!-- 2 media: side by side -->
    <div v-else-if="media.length === 2" class="grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
      <img src="./image.jpg" class="h-full w-full object-cover" />
      <img src="./image2.jpg" class="h-full w-full object-cover" />
    </div>

    <!-- 3 media: first spans full height on left -->
    <div
      v-else-if="media.length === 3"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <img src="./image.jpg" class="col-span-1 row-span-2 h-full w-full object-cover" />
      <img src="./image2.jpg" class="h-full w-full object-cover" />
      <img src="./image2.jpg" class="h-full w-full object-cover" />
    </div>

    <!-- 4 media: uniform grid -->
    <div
      v-else-if="media.length === 4"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <img src="./image2.jpg" class="h-full w-full object-cover" />
      <img src="./image.jpg" class="h-full w-full object-cover" />
      <img src="./image.jpg" class="h-full w-full object-cover" />
      <img src="./image2.jpg" class="h-full w-full object-cover" />
    </div>

    <!-- Fallback for >4: simple 3-column grid -->
    <div
      v-else
      class="grid gap-0.5 overflow-hidden rounded-xl"
      :class="media.length > 6 ? 'grid-cols-4' : 'grid-cols-3'"
    >
      <img
        v-for="(m, i) in media"
        :key="i"
        :src="i % 2 === 0 ? './image.jpg' : './image2.jpg'"
        class="h-full w-full object-cover"
      />
    </div>
  </div>
</template>
