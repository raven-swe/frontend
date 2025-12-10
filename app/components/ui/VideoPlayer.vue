<script setup lang="ts">
// Import the Vue wrapper
import { VideoPlayer } from '@videojs-player/vue';

interface Props {
  src: string;
  poster?: string;
  fluid?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  fluid: true,
});
</script>

<template>
  <ClientOnly>
    <VideoPlayer
      class="video-js vjs-default-skin overflow-hidden rounded-xl"
      :options="{
        controls: true,
        autoplay: false,
        preload: 'metadata',
        responsive: true,
        fluid: props.fluid,
        poster: props.poster,
        controlBar: { autoHide: false },
        sources: [
          {
            src: props.src,
            type: 'video/mp4',
          },
        ],
      }"
    />
  </ClientOnly>
</template>
