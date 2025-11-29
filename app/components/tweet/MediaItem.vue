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
  if (!isImage.value) return {}; // no aspect ratio for videos

  const { width, height } = props.media;
  if (width && height) return { aspectRatio: `${width} / ${height}` };
  return {};
});
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <NuxtImg
      v-if="isImage"
      :src="props.media.url"
      :alt="props.media.altText || 'Tweet media'"
      class="h-full w-full object-cover"
      :style="aspectStyle"
      format="webp"
    />

    <div v-else-if="isVideo" class="h-full w-full overflow-hidden rounded-xl">
      <VideoPlayer :src="props.media.url" :poster="props.media.altText" />
    </div>
  </div>
</template>
