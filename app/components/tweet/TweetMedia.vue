<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import MediaItem from './MediaItem.vue';
// Local placeholder image to show when there is no media
interface Props {
  media: TweetMedia[] | undefined;
  sizeClass?: string;
}
const props = defineProps<Props>();
const media = ref(props.media || []);
const sizeClass = computed(() => props.sizeClass ?? 'rounded-xl');
</script>

<template>
  <div class="w-full pt-2">
    <!-- 1 media -->
    <div v-if="media.length === 1" :class="['grid overflow-hidden', sizeClass]">
      <MediaItem :media="media[0]!" />
    </div>

    <!-- 2 media -->
    <div
      v-else-if="media.length === 2"
      :class="['grid grid-cols-2 gap-0.5 overflow-hidden', sizeClass]"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m" />
    </div>

    <!-- 3 media -->
    <div
      v-else-if="media.length === 3"
      :class="['grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden', sizeClass]"
    >
      <div class="col-span-1 row-span-2"><MediaItem :media="media[0]!" /></div>
      <MediaItem :media="media[1]!" />
      <MediaItem :media="media[2]!" />
    </div>

    <!-- 4 media -->
    <div
      v-else-if="media.length === 4"
      :class="['grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden', sizeClass]"
    >
      <MediaItem v-for="(m, i) in media" :key="i" :media="m!" />
    </div>
  </div>
</template>
