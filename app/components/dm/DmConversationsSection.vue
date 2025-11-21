<script lang="ts" setup>
import { useDmConversations } from '@/composables/useDmConversations';
import { showToaster } from '@/utils/showToaster';
import Spinner from '../ui/Spinner.vue';

const route = useRoute();
const router = useRouter();
const { conversations, loading, error } = useDmConversations();
const selectedId = computed(() => (route.params.conversationId as string) || null);

watch(error, (val) => {
  if (val) {
    showToaster('error', 'Failed to load conversations');
  }
});

function onSelect(id: string) {
  router.push({ path: `/messages/${id}` });
}
</script>
<template>
  <DmHeader />
  <DmSearchBar />
  <div v-if="loading" class="p-4">
    <Spinner size="1.5rem" />
  </div>
  <DmConversationList
    v-else
    :conversations="conversations"
    :selected-id="selectedId"
    @select="onSelect"
  />
</template>
