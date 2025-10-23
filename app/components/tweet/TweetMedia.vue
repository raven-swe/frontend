<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
interface Props {
  media: TweetMedia[] | undefined;
}
const props = defineProps<Props>();
// const images = computed(() => (props.media ? props.media.filter((m) => m.type === 'IMAGE') : []));
const gifs = computed(() => (props.media ? props.media.filter((m) => m.type === 'GIF') : []));
const videos = computed(() => (props.media ? props.media.filter((m) => m.type === 'VIDEO') : []));
// const firstImage = computed(() => props.media?.find((m) => m.type === 'IMAGE'));
</script>

<template>
  <div class="flex w-full flex-col items-center pt-2">
    <!-- Media (single image basic layout) -->
    <div class="border-border mt-3 overflow-hidden rounded-xl border-1">
      <!-- :alt="firstImage!.altText || 'Tweet media'" -->
      <NuxtImg
        src="/oklahoma-city-thunder-black-and-gold-niwgymcycoo5z0v3.jpg"
        class="h-auto w-full object-cover"
        format="webp"
      />
    </div>
    <div
      v-for="(gif, index) in gifs"
      :key="index"
      class="border-border mt-3 overflow-hidden rounded-xl border-1"
    >
      <img :src="gif.url" class="w-full" :alt="gif.altText || 'Tweet media'" />
    </div>
    <div
      v-for="(video, index) in videos"
      :key="index"
      class="border-border mt-3 max-w-[34rem] overflow-hidden rounded-xl border-1"
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
