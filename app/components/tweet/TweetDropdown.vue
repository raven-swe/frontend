<script lang="ts" setup>
import { useQueryClient, type InfiniteData } from '@tanstack/vue-query';
import { deleteTweet } from '~/services/tweet/actionButtonsService';
import { showToaster } from '~/utils/showToaster';
import type { Tweet } from '~~/shared/types/tweets';

const props = withDefaults(
  defineProps<{
    tweet: Tweet;
    username: string;
    tweetView?: boolean;
  }>(),
  {
    tweetView: false,
  },
);

const queryClient = useQueryClient();

interface TweetPage {
  data: Tweet[];
  [key: string]: unknown;
}

function removeTweetFromInfiniteData(
  data: InfiniteData<TweetPage> | undefined,
  tweetId: string,
): InfiniteData<TweetPage> | undefined {
  if (!data || !data.pages) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.filter((t: Tweet) => t.id !== tweetId),
    })),
  };
}

const router = useRouter();

async function handleDelete() {
  try {
    await deleteTweet(props.tweet.id);
    showToaster('success', $t('tweet.delete-success'));

    const queryKeys = [
      ['for-you'],
      ['following'],
      ['profile', props.tweet.author.username, 'tweets'],
      ['profile', props.tweet.author.username, 'tweets-replies'],
      ['profile', props.tweet.author.username, 'tweets-media'],
      ['profile', props.tweet.author.username, 'tweets-likes'],
    ];

    queryKeys.forEach((key) => {
      queryClient.setQueriesData<InfiniteData<TweetPage>>({ queryKey: key }, (oldData) =>
        removeTweetFromInfiniteData(oldData, props.tweet.id),
      );
    });
    if (props.tweetView) {
      await router.back();
      return;
    }
  } catch {
    showToaster('error', $t('tweet.delete-error'));
  }
}
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
          @click="handleDelete"
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
