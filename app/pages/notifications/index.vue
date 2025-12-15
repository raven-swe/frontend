<script lang="ts" setup>
import { Like, Follow, Repost, Reply, QuoteMention } from '~/components/notifications';
import { useNotificationsList } from '~/composables/useNotificationsList';
import type { Notification } from '~~/shared/types/notifications';
import { watch } from 'vue';

definePageMeta({
  layout: 'notifications',
});

const lastNotification = inject<Ref<Notification | null>>('lastNotification')!;
const unseenNotificationsCount = inject<Ref<number>>('unseenNotificationsCount')!;

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

const {
  notifications,
  virtualRows,
  totalSize,
  measureElement,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  markAllSeen,
  getActors,
  getTotalActorsCount,
} = useNotificationsList({
  queryKey: ['notifications-main'],
  filter: null,
  lastNotification,
  relatedQueryKeys: [['notifications-mentions']],
  unseenRef: unseenNotificationsCount,
});

const { mutate: followUser } = useFollowMutation();

watch(
  () => notifications.value.some((n) => !n.isSeen),
  (hasUnseen) => {
    if (hasUnseen) {
      setTimeout(() => {
        markAllSeen();
        unseenNotificationsCount.value = 0;
      }, 600);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="mx-auto max-w-[700px]">
    <ClientOnly>
      <div v-if="notifications">
        <div
          data-testid="notifications-list"
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
              transform: `translateY(${virtualRows[0] ? virtualRows[0].start - 0 : 0}px)`,
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
                :actors="getActors(notifications[virtualRow.index]!.actorSummary)"
                :total-actors-count="
                  getTotalActorsCount(notifications[virtualRow.index]!.actorSummary)
                "
                :is-seen="notifications[virtualRow.index]!.isSeen"
                :tweet="notifications[virtualRow.index]!.tweetSummary?.primaryTweet"
                @follow="(username: string) => followUser({ username, action: 'follow' })"
                @unfollow="(username: string) => followUser({ username, action: 'unfollow' })"
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
