<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import MediaItem from './MediaItem.vue';

interface Props {
  media: TweetMedia[] | undefined;
  compact?: boolean; // when true (quoted tweet), render smaller media
}
const props = defineProps<Props>();
const media = ref(props.media || []);
const compact = computed(() => props.compact === true);

// Size class for single media (taller)
const singleSizeClass = computed(() => (compact.value ? 'max-h-[250px]' : 'max-h-[500px]'));
// Size class for multi-image grids
const sizeClass = computed(() => (compact.value ? 'max-h-[200px]' : 'max-h-[400px]'));
</script>

<template>
  <div :class="[compact ? 'w-full max-w-[300px]' : 'w-full', 'pt-2']">
    <!-- 1 media -->
    <div v-if="media.length === 1" :class="['grid overflow-hidden rounded-xl', singleSizeClass]">
      <MediaItem :media="media[0]!" :compact="compact" :rounded="true" />
    </div>

    <!-- 2 media: side by side -->
    <div
      v-else-if="media.length === 2"
      :class="[
        'border-border grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border-1',
        sizeClass,
      ]"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m" :compact="compact" :rounded="false" />
    </div>

    <!-- 3 media: first spans full height on left -->
    <div
      v-else-if="media.length === 3"
      :class="[
        'border-border grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl border-1',
        sizeClass,
      ]"
    >
      <div class="col-span-1 row-span-2 flex items-center justify-center">
        <MediaItem :media="media[0]!" :compact="compact" :rounded="false" />
      </div>
      <MediaItem :media="media[1]!" :compact="compact" :rounded="false" />
      <MediaItem :media="media[2]!" :compact="compact" :rounded="false" />
    </div>

    <!-- 4 media: uniform grid -->
    <div
      v-else-if="media.length === 4"
      :class="[
        'border-border grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl border-1',
        sizeClass,
      ]"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m!" :compact="compact" :rounded="false" />
    </div>
  </div>
</template>
