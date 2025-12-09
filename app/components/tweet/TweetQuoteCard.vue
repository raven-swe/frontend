<script setup lang="ts">
import { ref, computed } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
interface Props {
  tweet: Tweet;
  isPreview?: boolean;
}
const props = defineProps<Props>();
const router = useRouter();

// Format createdAt to a short relative time like "6h", "3d", "2m"
const tweet = ref<Tweet>(JSON.parse(JSON.stringify(props.tweet)));
type Segment = { type: 'text' | 'mention' | 'hashtag'; text: string; href?: string };

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

function handleTweetClick() {
  if (props.isPreview) return;
  router.push(`/profile/${props.tweet.author.username}/status/${props.tweet.id}`);
}
</script>

<template>
  <!-- Compact embedded quoted tweet card -->
  <div
    :id="'quoted-tweet-' + props.tweet.id"
    class="border-border bg-muted/40 hover:bg-muted/40 mt-2 rounded-xl border p-3 text-sm"
    @click.prevent.stop="handleTweetClick"
  >
    <!-- Header: avatar + names inline -->
    <div class="mb-1 flex items-center gap-2">
      <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
        <Avatar :img="props.tweet.author.avatarUrl || '/default_profile.png'" class="h-6 w-6" />
      </NuxtLink>
      <NuxtLink
        :to="`/profile/${props.tweet.author.username}`"
        class="flex items-center"
        @click.stop
      >
        <span class="max-w-[8rem] truncate font-semibold hover:underline">{{
          props.tweet.author.displayName
        }}</span>
        <span
          class="text-muted-foreground ms-1 max-w-[6rem] truncate"
          v-text="'@' + props.tweet.author.username"
        />
        <span class="text-muted-foreground mx-1">·</span>
        <time
          :title="formatDate(tweet.createdAt, $i18n.locale)"
          :datetime="tweet.createdAt"
          class="text-muted-foreground hover:underline"
          >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
        >
      </NuxtLink>
    </div>

    <!-- Content -->
    <p class="leading-relaxed break-words whitespace-pre-wrap">
      <template v-for="(seg, i) in contentSegments" :key="i">
        <span v-if="seg.type === 'text'" class="inline">{{ seg.text }}</span>
        <a
          v-else
          :href="seg.href"
          class="text-primary inline font-medium hover:underline"
          @click.stop
        >
          {{ seg.text }}
        </a>
      </template>
    </p>

    <!-- Media (if any) -->
    <TweetMedia
      v-if="tweet.media?.length"
      :media="tweet.media"
      :tweet-id="tweet.id"
      compact
      @click.stop
    />
  </div>
</template>
