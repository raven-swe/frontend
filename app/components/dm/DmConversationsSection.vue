<script lang="ts" setup>
import { useDmConversations } from '@/composables/useDmConversations';
import { showToaster } from '@/utils/showToaster';
import Spinner from '../ui/Spinner.vue';

const route = useRoute();
const router = useRouter();
const { conversations, loading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useDmConversations();
const selectedId = computed(() => (route.params.conversationId as string) || null);

watch(error, (val) => {
  if (val) {
    showToaster('error', 'Failed to load conversations');
  }
});

function onSelect(id: string) {
  router.push({ path: `/messages/${id}` });
}

function onLoadMore() {
  fetchNextPage();
}
</script>
<template>
  <div class="flex h-full flex-col">
    <DmHeader />

    <div v-if="loading" class="flex items-center justify-center p-4">
      <Spinner size="1.5rem" />
    </div>
    <DmConversationList
      v-else
      :conversations="conversations"
      :selected-id="selectedId"
      :has-next-page="hasNextPage ?? false"
      :is-fetching-next-page="isFetchingNextPage"
      @select="onSelect"
      @load-more="onLoadMore"
    />
  </div>
</template>
