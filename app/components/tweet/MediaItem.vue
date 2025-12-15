<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import { computed } from 'vue';
import VideoPlayer from '~/components/ui/VideoPlayer.vue';

interface Props {
  media: TweetMedia;
  compact?: boolean; // when true render smaller media (quoted tweets)
  rounded?: boolean; // when true apply rounded corners (single media only)
}
const props = defineProps<Props>();

const shouldRound = computed(() => props.rounded !== false);

const isVideo = computed(() => props.media.type === 'VIDEO');
const isGif = computed(() => props.media.type === 'GIF');
const isImage = computed(() => props.media.type === 'IMAGE' || isGif.value);
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden"
    :class="shouldRound ? (props.compact ? 'rounded-lg' : 'rounded-xl') : ''"
  >
    <NuxtImg
      v-if="isImage"
      :src="props.media.url"
      :alt="props.media.altText || 'Tweet media'"
      class="h-full w-full object-cover object-center"
      format="webp"
      data-cy="tweet-media-image"
    />

    <div
      v-else-if="isVideo"
      class="flex h-full max-h-full w-full items-center justify-center overflow-hidden"
      :class="shouldRound ? (props.compact ? 'rounded-lg' : 'rounded-xl') : ''"
      @click.stop
    >
      <VideoPlayer
        :src="props.media.url"
        :poster="props.media.altText"
        class="h-auto max-h-full w-full object-contain"
        data-cy="tweet-media-video"
      />
    </div>
  </div>
</template>
