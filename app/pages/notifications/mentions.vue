<script lang="ts" setup>
import { QuoteMention } from '~/components/notifications';
import { useNotificationsList } from '~/composables/useNotificationsList';
import type { Notification } from '~~/shared/types/notifications';

definePageMeta({
  layout: 'notifications',
});

const lastNotification = inject<Ref<Notification | null>>('lastNotification')!;
const unseenNotificationsCount = inject<Ref<number>>('unseenNotificationsCount')!;

const {
  notifications,
  virtualRows,
  totalSize,
  measureElement,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  markAllSeen,
  getPrimaryActor,
} = useNotificationsList({
  queryKey: ['notifications-mentions'],
  filter: 'mentions',
  lastNotification,
  relatedQueryKeys: [['notifications-main']],
  unseenRef: unseenNotificationsCount,
});

const { mutate: followUser } = useFollowMutation();

onMounted(() => {
  const hasUnseen = notifications.value.some((n) => !n.isSeen);
  if (hasUnseen) {
    markAllSeen();
    unseenNotificationsCount.value = 0;
  }
});
</script>

<template>
  <div class="mx-auto max-w-[700px]">
    <ClientOnly>
      <div v-if="notifications">
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
              transform: `translateY(${virtualRows[0] ? virtualRows[0].start - 0 : 0}px)`,
            }"
          >
            <div
              v-for="virtualRow in virtualRows"
              :key="notifications[virtualRow.index]?.id || String(virtualRow.key)"
              :ref="measureElement"
              :data-index="virtualRow.index"
            >
              <QuoteMention
                v-if="
                  notifications[virtualRow.index] &&
                  notifications[virtualRow.index]!.tweetSummary?.primaryTweet
                "
                :timestamp="notifications[virtualRow.index]!.latestEventAt ?? ''"
                :actor="getPrimaryActor(notifications[virtualRow.index]!.actorSummary)"
                :is-seen="notifications[virtualRow.index]!.isSeen"
                :tweet="
                  notifications[virtualRow.index]!.tweetSummary!.primaryTweet as unknown as Tweet
                "
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
      <h1 class="text-xl font-semibold">{{ $t('notifications.no-mentions') }}</h1>
    </div>
  </div>
</template>
