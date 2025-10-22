<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { relativeTime } from '~/utils/index';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
// Format createdAt to a short relative time like "6h", "3d", "2m"

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
    const text = `@${m.username} `;
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
    const text = `#${h.hashtag} `;
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
</script>

<template>
  <article class="border-b-border flex w-full max-w-[700px] gap-3 border-b-1 p-2">
    <Avatar
      :img="props.tweet.author.avatarUrl || '/default_profile.png'"
      size="sm"
      variant="primary"
    />

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
      <TweetMedia :media="props.tweet.media" />

      <!-- Actions -->
      <TweetActionButtons :tweet="props.tweet" />
    </div>
  </article>
</template>
