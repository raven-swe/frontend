<script lang="ts" setup>
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useVirtualizer } from '@tanstack/vue-virtual';
import useAccountSetup from '~/composables/useAccountSetup';
import { settingsService } from '~/services/settingsService';
import {
  useFollowMutation,
  useBlockMutation,
  useMuteMutation,
} from '~/composables/useProfileMutation';

const props = defineProps<{
  open: boolean;
}>();

const accountSetup = useAccountSetup();

const queryKey = computed(() => ['user-list', 'follow-suggestions']);
const {
  data: usersPaginated,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey,
  initialPageParam: null as string | null,
  queryFn: async ({ signal, pageParam }) =>
    await settingsService.getFollowSuggestions({
      cursor: pageParam,
      signal,
    }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const users = computed(() => usersPaginated.value?.pages.flatMap((page) => page.data) || []);
const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
const { mutate: muteUser } = useMuteMutation();

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);

const rowVirtualizerOptions = computed(() => {
  return {
    count: hasNextPage ? users.value.length + 1 : users.value.length,
    estimateSize: () => 95.95, // Approximate height of UserRow component with one line of bio
    overscan: 3,
    getItemKey: (index: number) => users.value[index]?.username || index,
    getScrollElement: () => parentRef.value,
  };
});

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const measureElement = (el: Element | ComponentPublicInstance | null) => {
  if (!el) return;
  nextTick(() => {
    const element = 'nodeType' in el ? (el as HTMLElement) : (el as ComponentPublicInstance).$el;
    rowVirtualizer.value.measureElement(element);
  });
};

watchEffect(() => {
  const [lastItem] = [...virtualRows.value].reverse();

  if (!lastItem) {
    return;
  }

  if (lastItem.index >= users.value.length - 2 && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});
const hasFollowedAtLeastOne = computed(() => {
  return users.value?.some((user) => user.relationship?.following) ?? false;
});
</script>

<template>
  <UiDialog :open="props.open">
    <UiDialogContent hide-close-button>
      <template #header>
        <LogoRaven class="size-8" />
      </template>
      <UiDialogHeader class="mx-auto w-full max-w-100">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.account-setup.follow-user.title')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.account-setup.follow-user.description') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <UiSpinner v-if="isLoading" class="mx-20" />
      <ClientOnly>
        <div
          v-if="users && users.length !== 0"
          ref="parentRef"
          class="mb-4 w-full flex-1 overflow-y-auto contain-strict"
        >
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
                transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
              }"
            >
              <div
                v-for="virtualRow in virtualRows"
                :key="users[virtualRow.index]?.username || String(virtualRow.key)"
                :ref="measureElement"
                :data-index="virtualRow.index"
              >
                <UserRow
                  v-if="users[virtualRow.index]"
                  :user="users[virtualRow.index]!"
                  :show-dropdown="false"
                  @follow="
                    followUser({ username: users[virtualRow.index]!.username, action: 'follow' })
                  "
                  @unfollow="
                    followUser({ username: users[virtualRow.index]!.username, action: 'unfollow' })
                  "
                  @block="
                    blockUser({ username: users[virtualRow.index]!.username, action: 'block' })
                  "
                  @mute="muteUser({ username: users[virtualRow.index]!.username, action: 'mute' })"
                  @unblock="
                    blockUser({ username: users[virtualRow.index]!.username, action: 'unblock' })
                  "
                  @unmute="
                    muteUser({ username: users[virtualRow.index]!.username, action: 'unmute' })
                  "
                />
              </div>
            </div>
          </div>
          <div
            v-if="(hasNextPage && isFetchingNextPage) || isLoading"
            class="text-primary flex shrink-0 items-center justify-center py-4"
          >
            <UiSpinner />
          </div>
        </div>
      </ClientOnly>
      <div class="flex flex-col items-center justify-center">
        <UiButton
          class="w-full max-w-100"
          size="xl"
          :disabled="!hasFollowedAtLeastOne"
          @click="accountSetup.goToNextStep()"
        >
          {{ $t('ui.next') }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>
