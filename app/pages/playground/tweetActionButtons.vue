<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import Button from '~/components/ui/Button.vue';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
</script>

<template>
  <div class="text-muted-foreground text-md mt-3 flex w-full items-center justify-between">
    <label class="hover:text-brand-blue relative flex items-center justify-center gap-[1px]">
      <Button variant="tweet-icon-turquoise" size="icon-md">
        <Icon name="tabler:message-circle-2" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.replyCount }}</span>
    </label>

    <label
      v-if="props.tweet.isRetweeted"
      class="hover:text-brand-turquoise relative flex items-center justify-center gap-[1px]"
    >
      <Button variant="tweet-icon-turquoise" size="icon-md">
        <Icon name="tabler:repeat" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.retweetCount }}</span>
    </label>
    <label
      v-else
      class="hover:text-brand-turquoise text-brand-turquoise relative flex items-center justify-center gap-[1px]"
    >
      <Button variant="tweet-icon-turquoise-active" size="icon-md">
        <Icon name="tabler:repeat" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.retweetCount }}</span>
    </label>

    <label
      v-if="props.tweet.isLiked"
      class="hover:text-brand-red text-brand-red relative flex items-center justify-center"
    >
      <Button variant="tweet-icon-red-active" size="icon-md">
        <Icon name="line-md:heart-filled" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.likeCount }}</span>
    </label>

    <label v-else class="hover:text-brand-red relative flex items-center justify-center gap-[1px]">
      <Button variant="tweet-icon-red" size="icon-md">
        <Icon name="tabler:heart" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.likeCount }}</span>
    </label>

    <Button variant="tweet-icon-blue" size="icon-md" class="hover:text-brand-blue">
      <Icon name="lucide:share" size="1.2rem" />
    </Button>
  </div>
</template>
