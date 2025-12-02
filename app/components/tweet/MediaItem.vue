<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import { computed } from 'vue';

// Import your new Video.js wrapper
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
      loading="lazy"
    />

    <div v-else-if="isVideo" class="w-full overflow-hidden rounded-xl" :style="aspectStyle">
      <VideoPlayer :src="props.media.url" :poster="props.media.altText" />
    </div>
  </div>
</template>
