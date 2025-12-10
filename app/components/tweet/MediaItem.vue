<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import { computed } from 'vue';

// Import your new Video.js wrapper
import VideoPlayer from '~/components/ui/VideoPlayer.vue';

interface Props {
  media: TweetMedia;
  compact?: boolean; // when true render smaller media (quoted tweets)
}

const props = defineProps<Props>();

const isVideo = computed(() => props.media.type === 'VIDEO');
const isGif = computed(() => props.media.type === 'GIF');
const isImage = computed(() => props.media.type === 'IMAGE' || isGif.value);

const aspectStyle = computed(() => {
  if (!isImage.value) return {};
  const { width, height } = props.media;
  if (width && height) {
    // If compact, we simply rely on container max-width; aspect ratio unchanged.
    if (props.compact) return { aspectRatio: `${width / 2} / ${height / 2}` };
    else return { aspectRatio: `${width} / ${height}` };
  }
  return {};
});
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden"
    :class="props.compact ? 'rounded-lg' : 'rounded-xl'"
  >
    <NuxtImg
      v-if="isImage"
      :src="props.media.url"
      :alt="props.media.altText || 'Tweet media'"
      class="h-full w-full object-cover"
      :style="aspectStyle"
      format="webp"
      loading="lazy"
    />

    <div
      v-else-if="isVideo"
      class="h-full w-full overflow-hidden"
      :class="props.compact ? 'rounded-lg' : 'rounded-xl'"
      @click.stop
    >
      <VideoPlayer :src="props.media.url" :poster="props.media.altText" />
    </div>
  </div>
</template>
