<script lang="ts" setup>
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { apiFetch } from '~/api';
import UserRow from '~/components/ui/UserRow.vue';

definePageMeta({
  layout: 'follower-following',
});
const router = useRouter();
const username = computed(() => {
  const val = router.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});

const queryKey = computed(() => ['user-list', username.value, 'followers']);
const {
  data: usersPaginated,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey,
  initialPageParam: null as string | null,
  queryFn: async ({ signal, pageParam }) => {
    const response = await apiFetch(`/api/users/${username.value}/followers`, {
      signal,
      query: {
        cursor: pageParam,
      },
    });
    return response;
  },
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const users = computed(() => usersPaginated.value?.pages.flatMap((page) => page.data) || []);
const { mutate: followUser } = useFollowMutation(username.value || '');
const { mutate: blockUser } = useBlockMutation(username.value || '');
const { mutate: muteUser } = useMuteMutation(username.value || '');

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);
onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
});

const rowVirtualizerOptions = computed(() => {
  return {
    count: hasNextPage ? users.value.length + 1 : users.value.length,
    estimateSize: () => 95.95, // Approximate height of UserRow component with one line of bio
    overscan: 3,
    scrollMargin: parentOffsetRef.value,
    getItemKey: (index: number) => users.value[index]?.username || index,
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

watchEffect(() => {
  const [lastItem] = [...virtualRows.value].reverse();

  if (!lastItem) {
    return;
  }

  if (lastItem.index >= users.value.length - 3 && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});
</script>

<template>
  <ClientOnly>
    <div v-if="users && users.length !== 0" ref="parentRef">
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
            :key="users[virtualRow.index]?.username || String(virtualRow.key)"
            :ref="measureElement"
            :data-index="virtualRow.index"
          >
            <UserRow
              v-if="users[virtualRow.index]"
              :user="users[virtualRow.index]!"
              @follow="
                followUser({ username: users[virtualRow.index]!.username, action: 'follow' })
              "
              @unfollow="
                followUser({ username: users[virtualRow.index]!.username, action: 'unfollow' })
              "
              @block="blockUser({ username: users[virtualRow.index]!.username, action: 'block' })"
              @mute="muteUser({ username: users[virtualRow.index]!.username, action: 'mute' })"
              @unblock="
                blockUser({ username: users[virtualRow.index]!.username, action: 'unblock' })
              "
              @unmute="muteUser({ username: users[virtualRow.index]!.username, action: 'unmute' })"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="(hasNextPage && isFetchingNextPage) || isLoading"
      class="text-primary flex shrink-0 items-center justify-center py-4"
    >
      <UiSpinner />
    </div>
  </ClientOnly>
</template>
