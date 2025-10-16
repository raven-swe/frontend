<script setup lang="ts">
import Button from '~/components/ui/Button.vue';
import type { Tweet } from '~~/shared/types/tweets';

interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
console.log(1231231);
// Format createdAt to a short relative time like "6h", "3d", "2m"
const relativeTime = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  const months = Math.floor(diff / 2592000);
  return `${months}mo`;
};

type Segment = { type: 'text' | 'mention' | 'hashtag'; text: string; href?: string };

// Build content segments using entities positions so we can style mentions and hashtags
const contentSegments = computed<Segment[]>(() => {
  const segments: Segment[] = [];
  const content = props.tweet.content || '';
  const { entities } = props.tweet;
  if (!entities || (!entities.mentions?.length && !entities.hashtags?.length)) {
    return [{ type: 'text', text: content }];
  }

  type Range = {
    start: number;
    end: number;
    type: 'mention' | 'hashtag';
    text: string;
    href: string;
  };
  const ranges: Range[] = [];

  for (const m of entities.mentions || []) {
    const start = m.startPosition;
    const text = `@${m.username}`;
    ranges.push({
      start,
      end: start + text.length,
      type: 'mention',
      text,
      href: `/@${m.username}`,
    });
  }
  for (const h of entities.hashtags || []) {
    const start = h.startPosition;
    const text = `#${h.hashtag}`;
    ranges.push({
      start,
      end: start + text.length,
      type: 'hashtag',
      text,
      href: `/hashtag/${h.hashtag}`,
    });
  }

  ranges.sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ type: 'text', text: content.slice(cursor, r.start) });
    }
    segments.push({ type: r.type, text: r.text, href: r.href });
    cursor = r.end;
  }
  if (cursor < content.length) {
    segments.push({ type: 'text', text: content.slice(cursor) });
  }
  return segments;
});

const firstImage = computed(() => props.tweet.media?.find((m) => m.type === 'IMAGE'));
</script>

<template>
  <article class="border-border flex gap-3 border-b p-4">
    <!-- Avatar -->
    <!-- <NuxtImg
      :src="props.tweet.author.avatarUrl"
      :alt="props.tweet.author.displayName"
      class="size-12 rounded-full object-cover"
      format="webp"
      width="48"
      height="48"
    /> -->

    <!-- Main -->
    <div class="min-w-0 flex-1">
      <!-- Header: display name, username, time -->
      <div class="flex flex-wrap items-center gap-x-1 text-sm">
        <span class="cursor-pointer font-semibold hover:underline">{{
          props.tweet.author.displayName
        }}</span>
        <span class="text-muted-foreground" v-text="'@' + props.tweet.author.username" />
        <span class="text-muted-foreground">·</span>
        <time :datetime="props.tweet.createdAt" class="text-muted-foreground">{{
          relativeTime(props.tweet.createdAt)
        }}</time>
      </div>

      <!-- Content -->
      <p class="mt-1 leading-relaxed break-words whitespace-pre-wrap">
        <template v-for="(seg, i) in contentSegments" :key="i">
          <template v-if="seg.type === 'text'">{{ seg.text }}</template>
          <NuxtLink
            v-else
            :to="seg.href"
            class="font-medium"
            :class="
              seg.type === 'mention'
                ? 'text-primary hover:underline'
                : 'text-primary hover:underline'
            "
          >
            {{ seg.text }}
          </NuxtLink>
        </template>
      </p>

      <!-- Media (single image basic layout) -->
      <div
        v-if="firstImage"
        class="ring-border mt-3 max-w-[34rem] overflow-hidden rounded-2xl ring-1"
      >
        <NuxtImg
          :src="firstImage!.url"
          :alt="firstImage!.altText || 'Tweet media'"
          class="h-auto w-full object-cover"
          :width="firstImage!.width || 600"
          :height="firstImage!.height || 400"
          format="webp"
        />
      </div>

      <!-- Actions -->
      <div class="text-muted-foreground mt-3 flex max-w-[30rem] flex-row gap-2 text-sm">
        <label
          class="hover:text-brand-blue relative flex w-fit items-center justify-center gap-[1px]"
        >
          <Button variant="tweet-icon-turquoise" size="icon-xs">
            <Icon name="tabler:message-circle-2" class="size-5" />
          </Button>
          <span class="absolute start-7">{{ props.tweet.replyCount }}</span>
        </label>

        <label
          class="hover:text-brand-turquoise relative flex w-fit items-center justify-center gap-[1px]"
        >
          <Button variant="tweet-icon-turquoise" size="icon-xs">
            <Icon name="tabler:repeat" />
          </Button>
          <span class="absolute start-7">{{ props.tweet.retweetCount }}</span>
        </label>
        <label
          class="hover:text-brand-red relative flex w-fit items-center justify-center gap-[1px]"
        >
          <Button variant="tweet-icon-red" size="icon-xs">
            <Icon name="tabler:heart" />
          </Button>
          <span class="absolute start-7">{{ props.tweet.likeCount }}</span>
        </label>
      </div>
    </div>
  </article>
</template>
