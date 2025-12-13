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
</script>

<template>
  <div v-if="media.length > 0" :class="[compact ? 'w-full max-w-[300px]' : 'w-full', 'pt-2']">
    <!-- 1 media -->
    <div v-if="media.length === 1" class="grid overflow-hidden rounded-xl">
      <MediaItem :media="media[0]!" :compact="compact" />
    </div>

    <!-- 2 media: side by side -->
    <div
      v-else-if="media.length === 2"
      class="border-border grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m" :compact="compact" />
    </div>

    <!-- 3 media: first spans full height on left -->
    <div
      v-else-if="media.length === 3"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <div class="col-span-1 row-span-2"><MediaItem :media="media[0]!" :compact="compact" /></div>
      <MediaItem :media="media[1]!" :compact="compact" />
      <MediaItem :media="media[2]!" :compact="compact" />
    </div>

    <!-- 4 media: uniform grid -->
    <div
      v-else-if="media.length === 4"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m!" :compact="compact" />
    </div>
  </div>
</template>
