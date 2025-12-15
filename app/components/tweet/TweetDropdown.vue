<script lang="ts" setup>
import { useTweetDeleteMutation } from '~/composables/tweet/useTweetMutation';
import type { Tweet } from '~~/shared/types/tweets';

const props = withDefaults(
  defineProps<{
    tweet: Tweet;
    username: string;
    inTweetView?: boolean;
  }>(),
  {
    inTweetView: false,
  },
);

const { mutate: deleteTweet } = useTweetDeleteMutation();
const router = useRouter();

const handleDeleteTweet = () => {
  deleteTweet({ tweetId: props.tweet.id });
  if (props.inTweetView) {
    router.back();
  }
};
</script>
<template>
  <UiAlertDialog>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <slot />
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuItem as-child>
          <NuxtLink
            :to="`/profile/${props.tweet.author.username}/status/${props.tweet.id}/likes`"
            class="ltr:flex-row rtl:flex-row-reverse"
            data-cy="tweet-dropdown-likes-link"
          >
            <Icon name="ion:stats-chart" />{{ $t('tweet.engagement.label') }}
          </NuxtLink>
        </UiDropdownMenuItem>
        <UiDropdownMenuItem as-child @select.prevent>
          <UiAlertDialogTrigger as-child class="text-destructive ltr:flex-row rtl:flex-row-reverse">
            <div
              v-if="props.username === props.tweet.author.username"
              data-cy="tweet-dropdown-delete-item"
            >
              <Icon name="mi:delete" />
              <p>{{ $t('tweet.delete-tweet') }}</p>
            </div>
          </UiAlertDialogTrigger>
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>{{ $t('tweet.delete-dialog.title') }}</UiAlertDialogTitle>
        <UiAlertDialogDescription>
          {{ $t('tweet.delete-dialog.description') }}
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          data-cy="tweet-delete-confirm-button"
          @click="handleDeleteTweet"
        >
          {{ $t('ui.delete') }}
        </UiAlertDialogAction>
        <UiAlertDialogCancel data-cy="tweet-delete-cancel-button">{{
          $t('ui.cancel')
        }}</UiAlertDialogCancel>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
