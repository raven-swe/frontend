<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TweetMedia from '~/components/tweet/TweetMedia.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { tweetsService } from '~/services/tweet/tweetsService';
import { isApiError, isApiValidationError } from '~/utils/errorUtils';
import { showToaster } from '~/utils/showToaster';

definePageMeta({ layout: 'media' });

const route = useRoute();
const router = useRouter();
const tweetId = computed(() => route.params.id as string);

const isLoading = ref(false);
const isMainTweetFound = ref(true);
const tweetData = ref<Tweet | null>(null);

async function loadTweet() {
  if (!tweetId.value) return;
  isLoading.value = true;
  isMainTweetFound.value = true;
  try {
    const resp = await tweetsService.tweet(tweetId.value);
    tweetData.value = resp.data;
  } catch (error) {
    if ((isApiError(error) && error.data?.statusCode === 404) || isApiValidationError(error)) {
      isMainTweetFound.value = false;
    } else {
      showToaster('error', 'toaster.tweet-page.tweet-load-error', true);
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadTweet());

watch(
  () => route.params.id,
  () => {
    tweetData.value = null;
    loadTweet();
  },
);

function goBack() {
  router.back();
}
</script>

<template>
  <div>
    <button
      class="hover:bg-muted bg-background/60 fixed top-0 z-50 inline-flex h-12 w-full max-w-[700px] cursor-pointer items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
      @click="goBack"
    >
      <Icon class="ms-6" :name="$t('icons.back-button-icon')" size="1.3rem" />
      <span class="ms-5 text-xl font-bold">{{ $t('ui.post') }}</span>
    </button>

    <div class="mt-14 flex justify-center p-4">
      <div class="w-full max-w-[700px]">
        <div v-if="isLoading" class="text-primary flex items-center justify-center py-6">
          <UiSpinner />
        </div>

        <div v-else>
          <div v-if="!isMainTweetFound" class="mt-20 text-center">
            <h1 class="mb-5 text-2xl font-bold">{{ $t('errors.TWEET_NOT_FOUND') }}</h1>
            <UiButton
              variant="link"
              size="link"
              class="text-gray-600 dark:text-gray-400"
              @click="goBack"
            >
              {{ $t('errors.GO_BACK_HOME') }}
            </UiButton>
          </div>

          <div v-else>
            <TweetMedia v-if="tweetData?.media" :media="tweetData!.media" />
            <!-- <TweetActionButtons
              :tweet="tweetData!"
              @click.stop
              @like-success="onLikeSuccess"
              @unlike-success="onUnlikeSuccess"
              @retweet-success="onRetweetSuccess"
              @undo-retweet-success="onUndoRetweetSuccess"
            /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
