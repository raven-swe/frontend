<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import MediaItem from './MediaItem.vue';

interface Props {
  media: TweetMedia[] | undefined;
  compact?: boolean; // when true (quoted tweet), render smaller media
}
const props = defineProps<Props>();
const media = ref(props.media || []);
const compact = computed(() => !!props.compact);
</script>

<template>
  <div v-if="media.length" :class="[compact ? 'w-full max-w-[300px]' : 'w-full', 'pt-2']">
    <div
      class="border-border grid max-h-50 gap-0.5 overflow-hidden rounded-xl border"
      :class="{
        'max-h-125': !compact,
        'grid-cols-2': media.length >= 2,
        'grid-rows-2': media.length > 2,
      }"
    >
      <MediaItem
        v-for="m in media"
        :key="m.id || m.url"
        :media="m"
        :compact="compact"
        :rounded="false"
        :class="{
          'first:row-span-2': media.length === 3,
        }"
      />
    </div>
  </div>
</template>
