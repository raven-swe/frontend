<script setup lang="ts">
// Import the Vue wrapper
import { VideoPlayer } from '@videojs-player/vue';

// Import the default videojs to access Player type
import type videojs from 'video.js';

import 'video.js/dist/video-js.css';

interface Props {
  src: string;
  poster?: string;
}

const props = defineProps<Props>();
type VideoJsPlayer = ReturnType<typeof videojs>;

function onPlayerReady(player: VideoJsPlayer) {
  player.on('click', () => {
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  });
}
</script>

<template>
  <VideoPlayer
    class="video-js vjs-default-skin overflow-hidden rounded-xl"
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
    @mounted="onPlayerReady"
  />
</template>
