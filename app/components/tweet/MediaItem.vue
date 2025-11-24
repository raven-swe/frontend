<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  media: TweetMedia;
}

const props = defineProps<Props>();
const isVideo = computed(() => props.media.type === 'VIDEO');
const isGif = computed(() => props.media.type === 'GIF');
const isImage = computed(() => props.media.type === 'IMAGE' || isGif.value);

const containerEl = ref<HTMLElement | null>(null); // wrapper for video + controls
const videoEl = ref<HTMLVideoElement | null>(null);
const playing = ref(false);
const progress = ref(0);

const currentTime = ref('0:00');
const totalTime = ref('0:00');

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimes() {
  if (!videoEl.value) return;
  currentTime.value = formatTime(videoEl.value.currentTime);
  totalTime.value = formatTime(videoEl.value.duration || 0);
}

function togglePlay() {
  if (!videoEl.value) return;
  if (videoEl.value.paused || videoEl.value.ended) {
    void videoEl.value.play();
    playing.value = true;
  } else {
    videoEl.value.pause();
    playing.value = false;
  }
}

function onTimeUpdate() {
  if (!videoEl.value || !videoEl.value.duration) return;
  progress.value = videoEl.value.currentTime / videoEl.value.duration;
  updateTimes();
}

function seekTo(percentage: number) {
  if (!videoEl.value || !videoEl.value.duration) return;
  videoEl.value.currentTime = Math.max(0, Math.min(1, percentage)) * videoEl.value.duration;
  onTimeUpdate();
}

// Fullscreen toggle: request fullscreen on the wrapper container (not the <video>)
function toggleFullscreen() {
  const el = containerEl.value;
  if (!el) return;

  if (!document.fullscreenElement) {
    // Use the standard API (some browsers may require vendor prefixes but modern ones use this)
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

// Track fullscreen state specifically for our container (so we know when controls are inside fullscreen)
const isFullscreen = ref(false);
function syncFullscreen() {
  isFullscreen.value = !!(
    document.fullscreenElement &&
    containerEl.value &&
    document.fullscreenElement === containerEl.value
  );
}

onMounted(() => {
  if (videoEl.value) {
    videoEl.value.addEventListener('timeupdate', onTimeUpdate);
    videoEl.value.addEventListener('loadedmetadata', updateTimes);
    videoEl.value.addEventListener('play', () => (playing.value = true));
    videoEl.value.addEventListener('pause', () => (playing.value = false));
    videoEl.value.addEventListener('ended', () => (playing.value = false));
  }
  document.addEventListener('fullscreenchange', syncFullscreen);
  syncFullscreen();
});

onUnmounted(() => {
  if (videoEl.value) {
    videoEl.value.removeEventListener('timeupdate', onTimeUpdate);
    videoEl.value.removeEventListener('loadedmetadata', updateTimes);
  }
  document.removeEventListener('fullscreenchange', syncFullscreen);
});

watch(
  () => props.media.url,
  () => {
    progress.value = 0;
    playing.value = false;
    // Reset times
    currentTime.value = '0:00';
    totalTime.value = '0:00';
  },
);

// Aspect ratio
const aspectStyle = computed(() => {
  const { width, height } = props.media;
  if (
    typeof width === 'number' &&
    typeof height === 'number' &&
    width > 10 &&
    height > 10 &&
    width < 10000 &&
    height < 10000
  ) {
    return { aspectRatio: `${width} / ${height}` };
  }
  return {};
});

// Controls positioning when in fullscreen: controls live inside the container so they will be visible.
// We'll still tweak classes so they stick to the bottom.
const controlsPositionClass = computed(() =>
  isFullscreen.value ? 'fixed inset-x-0 bottom-0 z-[9999]' : 'absolute start-0 end-0 bottom-0',
);
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <!-- Image -->
    <NuxtImg
      v-if="isImage"
      :src="props.media.url"
      :alt="props.media.altText || 'Tweet media'"
      class="h-full w-full object-cover"
      :style="aspectStyle"
      format="webp"
      loading="lazy"
    />

    <!-- Video -->
    <div
      v-else-if="isVideo"
      ref="containerEl"
      class="group relative w-full overflow-hidden rounded-xl bg-black"
      :style="isFullscreen ? { width: '100vw', height: '100vh' } : {}"
    >
      <!-- Video element: allow pointer events to pass to wrapper (we catch clicks on wrapper) -->
      <video
        ref="videoEl"
        :src="props.media.url"
        :aria-label="props.media.altText || 'Tweet video'"
        class="h-auto w-full object-cover"
        :style="aspectStyle"
        preload="metadata"
        playsinline
        @click="togglePlay"
      />

      <!-- Controls bar: visible when not playing; hover/focus when playing -->
      <div
        :class="[
          controlsPositionClass,
          'flex items-center gap-4 bg-black/50 px-3 py-2 text-sm text-white transition-opacity duration-200',
          playing
            ? 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:opacity-100'
            : 'pointer-events-auto opacity-100',
        ]"
        @click.stop
      >
        <!-- Time (placed first so tests that select the first span get the time display, avoiding Icon internal spans) -->
        <span class="whitespace-nowrap">{{ currentTime }} / {{ totalTime }}</span>

        <!-- Play / Pause -->
        <button class="text-white" @click.stop.prevent="togglePlay">
          <!-- aria-label="Play/Pause" -->
          <Icon :name="playing ? 'ic:baseline-pause' : 'ic:baseline-play-arrow'" size="26" />
        </button>

        <!-- Progress Bar (clickable to seek) -->
        <div
          class="relative h-1 flex-1 cursor-pointer rounded bg-white/30"
          role="slider"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress * 100)"
          @click.stop.prevent="
            (e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = (e as MouseEvent).clientX - rect.left;
              const pct = x / rect.width;
              seekTo(pct);
            }
          "
        >
          <div
            class="absolute start-0 top-0 h-full rounded bg-white"
            :style="{ width: `${Math.round(progress * 100)}%` }"
          ></div>
        </div>

        <!-- Fullscreen -->
        <button class="text-white" @click.stop.prevent="toggleFullscreen">
          <!-- aria-label="Fullscreen" -->
          <Icon
            :name="isFullscreen ? 'ic:baseline-fullscreen-exit' : 'ic:baseline-fullscreen'"
            size="22"
          />
        </button>
      </div>
    </div>
  </div>
</template>
