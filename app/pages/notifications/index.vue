<script lang="ts" setup>
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import Follow from '~/components/notifications/Follow.vue';
import Like from '~/components/notifications/Like.vue';
import Repost from '~/components/notifications/Repost.vue';
import Reply from '~/components/notifications/Reply.vue';
import QuoteMention from '~/components/notifications/QuoteMention.vue';
import { notificationsService } from '~/services/notifications/notificationsService';
import type { ActorSummary, ActorSummaryContainer } from '~~/shared/types/notifications';

definePageMeta({
  layout: 'notifications',
});

// infinite query to fetch notifications
const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: ['notifications'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await notificationsService.getNotificationsMock({ cursor: pageParam, limit: 20 }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const notifications = computed(() => response.value?.pages.flatMap((page) => page.data) || []);
const { mutate: followUser } = useFollowMutation();

// Virtualization
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
});

const rowVirtualizerOptions = computed(() => {
  return {
    count: hasNextPage.value ? notifications.value.length + 1 : notifications.value.length,
    estimateSize: () => 100,
    overscan: 3,
    scrollMargin: parentOffsetRef.value,
    getItemKey: (index: number) => notifications.value[index]?.id || index,
  };
});

const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const measureElement = (el: Element | ComponentPublicInstance | null) => {
  if (!el) return;
  const element = 'nodeType' in el ? (el as HTMLElement) : (el as ComponentPublicInstance).$el;
  rowVirtualizer.value.measureElement(element);
};

watch(
  () => notifications.value.length,
  () => {
    setTimeout(() => {
      if (parentRef.value) {
        parentOffsetRef.value = parentRef.value.offsetTop;
      }
    }, 100);
  },
  { flush: 'post' },
);

// auto-fetch more when scrolling near the end
watchEffect(() => {
  const [lastItem] = [...virtualRows.value].reverse();

  if (!lastItem) {
    return;
  }

  if (
    lastItem.index >= notifications.value.length - 3 &&
    hasNextPage.value &&
    !isFetchingNextPage.value
  ) {
    fetchNextPage();
  }
});

function getPrimaryActor(actorSummary?: ActorSummaryContainer | null): ActorSummary {
  return (
    actorSummary?.previewActors?.[0] ?? {
      username: 'unknown',
      displayName: 'Unknown',
      avatarUrl: '/default_profile.png',
    }
  );
}

function componentForType(type: string) {
  switch (type) {
    case 'FOLLOW':
      return Follow;
    case 'LIKE':
      return Like;
    case 'RETWEET':
      return Repost;
    case 'REPLY':
      return Reply;
    case 'QUOTE':
      return QuoteMention;
    case 'MENTION':
      return QuoteMention;
    default:
      return Follow;
  }
}
</script>

<template>
  <div class="mx-auto max-w-[700px]">
    <ClientOnly>
      <div v-if="notifications" ref="parentRef">
        <div
          :style="{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }"
        >
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${
                virtualRows[0] ? virtualRows[0].start - rowVirtualizer.options.scrollMargin : 0
              }px)`,
            }"
          >
            <div
              v-for="virtualRow in virtualRows"
              :key="notifications[virtualRow.index]?.id || String(virtualRow.key)"
              :ref="measureElement"
              :data-index="virtualRow.index"
            >
              <component
                :is="componentForType(notifications[virtualRow.index]!.type)"
                v-if="notifications[virtualRow.index]"
                :timestamp="notifications[virtualRow.index]!.latestEventAt ?? ''"
                :actor="getPrimaryActor(notifications[virtualRow.index]!.actorSummary)"
                :is-seen="notifications[virtualRow.index]!.isSeen"
                :tweet="notifications[virtualRow.index]!.tweetSummary?.primaryTweet"
                @follow="
                  followUser({
                    username: getPrimaryActor(notifications[virtualRow.index]!.actorSummary)
                      .username,
                    action: 'follow',
                  })
                "
                @unfollow="
                  followUser({
                    username: getPrimaryActor(notifications[virtualRow.index]!.actorSummary)
                      .username,
                    action: 'unfollow',
                  })
                "
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary mt-20 flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </ClientOnly>

    <div
      v-if="notifications.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-20 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('notifications.no-notifications') }}</h1>
    </div>
  </div>
</template>
