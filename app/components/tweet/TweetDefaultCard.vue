<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { relativeTime, formatDate } from '~/utils/time';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
// Format createdAt to a short relative time like "6h", "3d", "2m"

type Segment = { type: 'text' | 'mention' | 'hashtag'; text: string; href?: string };
const tweet = ref(props.tweet);

// Update local tweet state when like/unlike succeeds
const onLikeSuccess = () => {
  if (!tweet.value.isLiked) {
    tweet.value.isLiked = true;
    tweet.value.likeCount = (tweet.value.likeCount ?? 0) + 1;
  }
};

const onUnlikeSuccess = () => {
  if (tweet.value.isLiked) {
    tweet.value.isLiked = false;
    const next = (tweet.value.likeCount ?? 0) - 1;
    tweet.value.likeCount = next < 0 ? 0 : next;
  }
};
const onRetweetSuccess = () => {
  if (!tweet.value.isRetweeted) {
    tweet.value.isRetweeted = true;
    tweet.value.retweetCount += 1;
  }
};

const onUndoRetweetSuccess = () => {
  if (tweet.value.isRetweeted) {
    tweet.value.isRetweeted = false;
    const next = (tweet.value.retweetCount ?? 0) - 1;
    tweet.value.retweetCount = next < 0 ? 0 : next;
  }
};

// Build content segments using entities positions so we can style mentions and hashtags
const contentSegments = computed<Segment[]>(() => {
  const segments: Segment[] = [];
  const content = tweet.value.content || '';
  const { entities } = tweet.value;
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
      href: `/profile/${m.username}`,
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
  <div
    v-if="props.tweet.isRetweeted"
    class="text-muted-foreground ms-2 mt-1 flex items-center gap-1 px-6"
  >
    <Icon name="tabler:repeat" size="1.2rem" />
    <span class="text-muted-foreground text-sm">
      {{ $t('tweet.retweeted-by-you') }}
    </span>
  </div>
  <article class="border-b-border flex w-full max-w-[700px] gap-3 border-b-1 p-2">
    <NuxtLink :to="`/profile/${props.tweet.author.username}`">
      <Avatar
        :img="props.tweet.author.avatarUrl || '/default_profile.png'"
        size="sm"
        variant="primary"
      />
    </NuxtLink>

    <!-- Main -->
    <div class="min-w-0 flex-1">
      <!-- Header: display name, username, time -->
      <div class="flex flex-wrap items-center gap-x-1 text-sm">
        <NuxtLink :to="`/profile/${props.tweet.author.username}`">
          <span class="cursor-pointer font-semibold hover:underline">{{
            props.tweet.author.displayName
          }}</span>
          <span class="text-muted-foreground" v-text="'@' + props.tweet.author.username" />
          <span class="text-muted-foreground">·</span>
        </NuxtLink>
        <time
          :title="formatDate(tweet.createdAt, $i18n.locale)"
          :datetime="tweet.createdAt"
          class="text-muted-foreground hover:cursor-pointer hover:underline"
          >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
        >
      </div>

      <!-- Content -->
      <p class="mt-1 leading-relaxed break-words whitespace-pre-wrap">
        <template v-for="(seg, i) in contentSegments" :key="i">
          <span v-if="seg.type === 'text'" class="inline">
            {{ seg.text }}
          </span>
          <NuxtLink v-else :to="seg.href">
            <a class="text-primary inline font-medium hover:underline">
              {{ seg.text }}
            </a>
          </NuxtLink>
        </template>
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" />

      <!-- Actions -->
      <TweetActionButtons
        :tweet="tweet"
        @like-success="onLikeSuccess"
        @unlike-success="onUnlikeSuccess"
        @retweet-success="onRetweetSuccess"
        @undo-retweet-success="onUndoRetweetSuccess"
      />
    </div>
  </article>
</template>
