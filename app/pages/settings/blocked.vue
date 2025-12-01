<script lang="ts" setup>
import UserList from '~/components/user/UserList.vue';
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
        <h1 class="text-2xl font-bold">{{ $t('setting.blocked.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.blocked.description') }}
      </p>
    </div>
    <UserList
      :fetcher-fn="
        async (cursor, signal) =>
          await settingsService.getBlockedPaginated({
            cursor,
            signal,
          })
      "
      :current-username="username"
      :show-dropdown="false"
      primary-action="block"
      query-key-suffix="blocked"
      :empty-title="$t('setting.blocked.empty-title')"
      :empty-description="$t('setting.blocked.empty-description')"
    />
  </div>
</template>
