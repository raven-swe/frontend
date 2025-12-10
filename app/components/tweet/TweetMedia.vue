<script setup lang="ts">
import type { TweetMedia } from '~~/shared/types/tweets';
import MediaItem from './MediaItem.vue';

interface Props {
  media: TweetMedia[] | undefined;
  compact?: boolean; // when true (quoted tweet), render smaller media
  tweetId?: string;
}
const props = defineProps<Props>();
const media = ref(props.media || []);
const compact = computed(() => props.compact === true);

const getLink = () => (props.tweetId ? `/media/${props.tweetId}` : undefined);
</script>

<template>
  <div v-if="media.length > 0" :class="[compact ? 'w-full max-w-[300px]' : 'w-full', 'pt-2']">
    <!-- 1 media -->
    <div v-if="media.length === 1" class="grid overflow-hidden rounded-xl">
      <NuxtLink
        v-if="media[0]!.type !== 'VIDEO' && tweetId"
        :to="getLink()"
        class="block h-full w-full"
      >
        <MediaItem :media="media[0]!" :compact="compact" />
      </NuxtLink>
      <MediaItem v-else :media="media[0]!" :compact="compact" />
    </div>

    <!-- 2 media: side by side -->
    <div
      v-else-if="media.length === 2"
      class="border-border grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border-1"
    >
      <template v-for="(m, i) in media" :key="i">
        <NuxtLink v-if="m.type !== 'VIDEO' && tweetId" :to="getLink()" class="block h-full w-full">
          <MediaItem :media="m" :compact="compact" />
        </NuxtLink>
        <MediaItem v-else :media="m" :compact="compact" />
      </template>
    </div>

    <!-- 3 media: first spans full height on left -->
    <div
      v-else-if="media.length === 3"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <div class="col-span-1 row-span-2">
        <NuxtLink
          v-if="media[0]!.type !== 'VIDEO' && tweetId"
          :to="getLink()"
          class="block h-full w-full"
        >
          <MediaItem :media="media[0]!" :compact="compact" />
        </NuxtLink>
        <MediaItem v-else :media="media[0]!" :compact="compact" />
      </div>

      <NuxtLink
        v-if="media[1]!.type !== 'VIDEO' && tweetId"
        :to="getLink()"
        class="block h-full w-full"
      >
        <MediaItem :media="media[1]!" :compact="compact" />
      </NuxtLink>
      <MediaItem v-else :media="media[1]!" :compact="compact" />

      <NuxtLink
        v-if="media[2]!.type !== 'VIDEO' && tweetId"
        :to="getLink()"
        class="block h-full w-full"
      >
        <MediaItem :media="media[2]!" :compact="compact" />
      </NuxtLink>
      <MediaItem v-else :media="media[2]!" :compact="compact" />
    </div>

    <!-- 4 media: uniform grid -->
    <div
      v-else-if="media.length === 4"
      class="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl"
    >
      <template v-for="(m, i) in media" :key="i">
        <NuxtLink v-if="m!.type !== 'VIDEO' && tweetId" :to="getLink()" class="block h-full w-full">
          <MediaItem :media="m!" :compact="compact" />
        </NuxtLink>
        <MediaItem v-else :media="m!" :compact="compact" />
      </template>
    </div>
  </div>
</template>
