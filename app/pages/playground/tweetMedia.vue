<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
interface Props {
  media: TweetMedia[] | undefined;
}
const props = defineProps<Props>();
const images = computed(() => (props.media ? props.media.filter((m) => m.type === 'IMAGE') : []));
const gifs = computed(() => (props.media ? props.media.filter((m) => m.type === 'GIF') : []));
const videos = computed(() => (props.media ? props.media.filter((m) => m.type === 'VIDEO') : []));
const firstImage = computed(() => props.media?.find((m) => m.type === 'IMAGE'));
</script>

<template>
  <div class="flex w-full flex-col items-center pt-2">
    <!-- Media (single image basic layout) -->
    <div
      v-if="images.length >= 1"
      class="ring-border mt-3 max-w-[34rem] overflow-hidden rounded-2xl ring-1"
    >
      <NuxtImg
        :src="firstImage!.url"
        :alt="firstImage!.altText || 'Tweet media'"
        class="h-auto w-full object-cover"
        :width="firstImage!.width || 600"
        :height="firstImage!.height || 400"
        format="webp"
      />
    </div>
    <div
      v-for="(gif, index) in gifs"
      :key="index"
      class="ring-border mt-3 max-w-[34rem] overflow-hidden rounded-2xl ring-1"
    >
      <img
        :src="gif.url"
        :class="`mx-auto w-[${gif.width || 600}px] h-[${gif.height || 400}px]`"
        :alt="gif.altText || 'Tweet media'"
      />
    </div>
    <div
      v-for="(video, index) in videos"
      :key="index"
      class="ring-border mt-3 max-w-[34rem] overflow-hidden rounded-2xl ring-1"
    >
      <video
        controls
        class="mx-auto w-80"
        :src="video?.url"
        :alt="video?.altText || 'Tweet media'"
      />
    </div>
  </div>
</template>
