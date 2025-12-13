<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import { useFollowMutation, useBlockMutation } from '~/composables/useProfileMutation';
interface Props {
  tweet: Tweet;
  isPreview?: boolean;
}
const props = defineProps<Props>();
const router = useRouter();

const tweet = ref<Tweet>(JSON.parse(JSON.stringify(props.tweet)));

function handleTweetClick() {
  if (props.isPreview) return;
  router.push(`/profile/${props.tweet.author.username}/status/${props.tweet.id}`);
}

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
</script>

<template>
  <!-- Compact embedded quoted tweet card -->
  <div
    :id="'quoted-tweet-' + props.tweet.id"
    class="border-border bg-background hover:bg-foreground/5 mt-2 rounded-xl border p-3 text-sm transition-colors duration-100"
    @click.prevent.stop="handleTweetClick"
  >
    <!-- Header: avatar + names inline -->
    <div class="mb-1 flex items-center">
      <UserHoverCard
        :username="props.tweet.author.username"
        @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
        @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
        @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
        @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
      >
        <NuxtLink :to="`/profile/${props.tweet.author.username}`" class="pe-2" @click.stop>
          <Avatar :img="props.tweet.author.avatarUrl || '/default_profile.png'" class="h-6 w-6" />
        </NuxtLink>
      </UserHoverCard>
      <UserHoverCard
        :username="props.tweet.author.username"
        @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
        @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
        @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
        @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
      >
        <NuxtLink
          :to="`/profile/${props.tweet.author.username}`"
          class="flex items-center"
          @click.stop
        >
          <span class="max-w-[8rem] truncate font-semibold hover:underline">{{
            props.tweet.author.displayName
          }}</span>
        </NuxtLink>
      </UserHoverCard>
      <UserHoverCard
        :username="props.tweet.author.username"
        @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
        @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
        @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
        @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
      >
        <NuxtLink
          :to="`/profile/${props.tweet.author.username}`"
          class="flex items-center"
          @click.stop
        >
          <span
            class="text-muted-foreground ms-1 max-w-[6rem] truncate"
            v-text="'@' + props.tweet.author.username"
          />
        </NuxtLink>
      </UserHoverCard>
      <span class="text-muted-foreground mx-1">·</span>
      <time
        :title="formatDate(tweet.createdAt, $i18n.locale)"
        :datetime="tweet.createdAt"
        class="text-muted-foreground hover:underline"
        >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
      >
    </div>

    <!-- Content -->
    <p class="leading-relaxed break-words whitespace-pre-wrap">
      <UiContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
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
