<script lang="ts" setup>
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const hh = h > 0 ? String(h).padStart(2, '0') + ':' : '';
  const mm = String(m).padStart(2, '0') + ':';
  const ss = String(s).padStart(2, '0');

  return hh + mm + ss;
}

const duration = ref<string>('');
function setDuration(event: Event) {
  const durationValue = (event.target as HTMLVideoElement).duration;
  duration.value = formatDuration(durationValue);
}

defineProps<{
  media?: TweetMedia;
  multiple?: boolean;
}>();
</script>
<template>
  <div class="relative size-full">
    <Icon
      v-if="multiple"
      name="lucide:images"
      class="absolute end-2 bottom-2 text-white"
      size="1.5rem"
    />
    <NuxtImg
      v-if="media?.type === 'IMAGE' || media?.type === 'GIF'"
      :src="media?.url"
      :alt="media?.altText || 'Media image'"
      class="border-background flex aspect-square size-full object-cover"
    />
    <video
      v-else-if="media?.type === 'VIDEO'"
      :src="media?.url"
      class="border-background flex aspect-square size-full object-cover"
      @loadedmetadata="(event) => setDuration(event)"
    ></video>
    <span
      v-if="duration"
      class="absolute start-2 bottom-2 rounded bg-black/60 px-1 py-0.5 text-xs text-white"
    >
      {{ duration }}
    </span>
  </div>
</template>

<style></style>
