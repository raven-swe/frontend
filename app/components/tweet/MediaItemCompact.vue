<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import { computed } from 'vue';
import VideoPlayer from '~/components/ui/VideoPlayer.vue';

interface Props {
  media: TweetMedia;
}

const props = defineProps<Props>();

const isVideo = computed(() => props.media.type === 'VIDEO');
const isGif = computed(() => props.media.type === 'GIF');
const isImage = computed(() => props.media.type === 'IMAGE' || isGif.value);

const aspectStyle = computed(() => {
  const { width, height } = props.media;
  if (width > 10 && height > 10 && width < 10000 && height < 10000) {
    return { aspectRatio: `${width} / ${height}` };
  }
  return { aspectRatio: '16 / 9' }; // Default fallback
});
</script>

<template>
  <div class="relative flex h-full w-full items-center justify-center overflow-hidden">
    <NuxtImg
      v-if="isImage"
      :src="props.media.url"
      :alt="props.media.altText || 'Tweet media'"
      class="max-h-[85vh] w-full object-contain"
      :style="aspectStyle"
      format="webp"
      loading="lazy"
    />

    <div
      v-else-if="isVideo"
      class="video-container overflow-hidden rounded-xl"
      :style="aspectStyle"
    >
      <VideoPlayer :src="props.media.url" :poster="props.media.altText" :fluid="false" />
    </div>
  </div>
</template>

<style scoped>
.video-container {
  width: 100%;
  max-width: 95vw;
  max-height: 95vh;
  margin: 0 auto;
}

.video-container :deep(.video-js) {
  width: 100% !important;
  height: 100% !important;
}

.video-container :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

.video-container :deep(.vjs-control-bar) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
}
</style>
