<script lang="ts" setup>
import { useQueryClient, type InfiniteData } from '@tanstack/vue-query';
import { deleteTweet } from '~/services/tweet/actionButtonsService';
import { showToaster } from '~/utils/showToaster';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  tweet: Tweet;
  username: string;
}>();

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

async function handleDelete() {
  try {
    await deleteTweet(props.tweet.id);
    showToaster('success', 'toaster.tweet.delete-success');

    const queryKeys = [
      ['for-you'],
      ['following'],
      ['profile', props.tweet.author.username, 'tweets'],
      ['profile', props.tweet.author.username, 'replies'],
      ['profile', props.tweet.author.username, 'media'],
    ];

    queryKeys.forEach((key) => {
      queryClient.setQueriesData<InfiniteData<TweetPage>>({ queryKey: key }, (oldData) =>
        removeTweetFromInfiniteData(oldData, props.tweet.id),
      );
    });
  } catch {
    showToaster('error', 'toaster.tweet.delete-error');
  }
}
console.log(props.username, props.tweet.author.username);
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
          >
            <Icon name="ion:stats-chart" />{{ $t('tweet.engagement.label') }}
          </NuxtLink>
        </UiDropdownMenuItem>
        <UiDropdownMenuItem as-child @select.prevent>
          <UiAlertDialogTrigger as-child>
            <div
              v-if="props.username === tweet.author.username"
              class="text-destructive flex w-full cursor-pointer items-center gap-2 p-2 ltr:flex-row rtl:flex-row-reverse"
            >
              <Icon name="mi:delete" size="1.25rem" />
              <h1>{{ $t('tweet.delete-tweet') }}</h1>
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
          @click="handleDelete"
        >
          {{ $t('ui.delete') }}
        </UiAlertDialogAction>
        <UiAlertDialogCancel>{{ $t('ui.cancel') }}</UiAlertDialogCancel>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
