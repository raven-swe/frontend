<script setup lang="ts">
import { useSearchUsers } from '@/composables/useSearchUsers';
import { useStartConversation } from '@/composables/useStartConversation';
import type { DmConversation } from '~~/shared/types/dm';
import type { CompactUser } from '~~/shared/types/user';

// Local state
const search = ref('');
const selectedUsername = ref<string | null>(null);

const open = defineModel<boolean>('open', { default: false });

const { users, loading } = useSearchUsers(search);
const router = useRouter();
const { startConversation, isStarting } = useStartConversation();

watch(users, (newUsers) => {
  console.warn('Users updated:', toRaw(newUsers));
});

const canProceed = computed(() => !!selectedUsername.value);

function toggleSelect(username: string) {
  selectedUsername.value = selectedUsername.value === username ? null : username;
}

function followStatus(u: CompactUser) {
  const isFollowing = u.relationship?.following ?? false;
  const isFollower = u.relationship?.follower ?? false;
  if (isFollowing && isFollower) return $t('dm.dialog.follow-each-other');
  if (isFollowing) return $t('dm.dialog.you-follow');
  return '';
}

function isBlocked(u: CompactUser) {
  return u.relationship?.blocking || u.relationship?.blockedBy;
}

function handleUserClick(u: CompactUser) {
  if (isBlocked(u)) return;
  toggleSelect(u.username);
}

async function onNewConversation() {
  if (!selectedUsername.value) return;
  const conversation = (await startConversation(selectedUsername.value)) as DmConversation;
  const id = conversation?.id;
  if (id) {
    router.push({ path: `/messages/${id}` });
    open.value = false;
  }
}
</script>

<template>
  <!-- Root dialog controlled via v-model:open -->
  <UiDialog v-model:open="open">
    <UiDialogOverlay />
    <UiDialogContent class="w-full max-w-xl overflow-hidden p-0">
      <UiDialogHeader class="border-muted/30 border-b px-4 py-3">
        <div class="flex items-center justify-between">
          <UiDialogTitle class="text-lg font-semibold">
            {{ $t('dm.dialog.new-message') }}
          </UiDialogTitle>

          <UiButton :disabled="!canProceed || isStarting" @click="onNewConversation">
            {{ $t('dm.dialog.next') }}
          </UiButton>
        </div>
        <UiDialogDescription class="sr-only">
          {{ $t('dm.dialog.search-people') }}
        </UiDialogDescription>
        <!-- Search input -->
        <div class="px-4 pt-3 pb-2">
          <label class="sr-only" :for="'dm-search'">{{ $t('dm.dialog.search-people') }}</label>
          <div class="bg-muted/20 flex items-center gap-2 rounded-xl px-3 py-2">
            <Icon name="ic:round-search" size="20" class="text-muted-foreground" />
            <input
              id="dm-search"
              v-model="search"
              type="text"
              :placeholder="$t('dm.dialog.search-people')"
              class="placeholder:text-muted-foreground/70 w-full bg-transparent outline-none"
            />
          </div>
        </div>
      </UiDialogHeader>

      <!-- List -->
      <div class="max-h-[60vh] overflow-y-auto">
        <div
          v-if="loading && search.trim().length > 0"
          class="flex items-center justify-center p-6"
        >
          <UiSpinner />
        </div>

        <div v-else>
          <div
            v-for="u in users || []"
            :key="u.username"
            class="flex items-center gap-3 px-4 py-3"
            :class="{
              'border-primary border-e-4': selectedUsername === u.username,
              'hover:bg-muted/20 cursor-pointer': !isBlocked(u),
              'cursor-not-allowed opacity-50': isBlocked(u),
            }"
            @click="handleUserClick(u)"
          >
            <UiAvatar size="sm" :img="u.avatarUrl" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate font-medium">{{ u.displayName }}</p>
                <p class="text-muted-foreground truncate before:content-['@']">{{ u.username }}</p>
              </div>
              <p v-if="isBlocked(u)" class="text-destructive mt-0.5 flex text-sm">
                {{ $t('dm.dialog.cant-message') }}
              </p>
              <p v-else-if="followStatus(u)" class="text-muted-foreground mt-0.5 flex text-sm">
                <Icon name="ic:sharp-person" size="18" class="text-muted-foreground" />
                {{ followStatus(u) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<style scoped></style>
