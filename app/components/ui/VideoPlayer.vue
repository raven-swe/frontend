<script setup lang="ts">
// Import the Vue wrapper
import { VideoPlayer } from '@videojs-player/vue';

interface Props {
  src: string;
  poster?: string;
}
const props = defineProps<Props>();
</script>

<template>
  <ClientOnly>
    <VideoPlayer
      class="video-js vjs-default-skin h-full w-full overflow-hidden"
      :options="{
        controls: true,
        autoplay: false,
        preload: 'metadata',
        responsive: true,
        fluid: true,
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

<style scoped>
.video-js {
  width: 100%;
  height: 100%;
}
.video-js .vjs-tech {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
