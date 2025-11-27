<script lang="ts" setup>
import UserList from '~/components/common/UserList.vue';
import { settingsService } from '~/services/settingsService';

const userStore = useUserStore();
const username = computed(() => userStore.user?.username.toLowerCase() || null);
</script>

<template>
  <div class="scroll-y-auto">
    <div class="border-b-border border-b-1 p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="bg-transparent"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.muted.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.muted.description') }}
      </p>
    </div>
    <UserList
      :fetcher-fn="
        async (cursor, signal) =>
          await settingsService.getMutedPaginated({
            cursor,
            signal,
          })
      "
      :current-username="username"
      :show-dropdown="false"
      primary-action="mute"
      query-key-suffix="muted"
      :empty-title="$t('setting.muted.empty-title')"
      :empty-description="$t('setting.muted.empty-description')"
    />
  </div>
</template>
