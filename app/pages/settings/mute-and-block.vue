<script lang="ts" setup></script>

<template>
  <div>
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="bg-transparent"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.mute-and-block.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.mute-and-block.description') }}
      </p>
    </div>
    <div class="mt-3 flex flex-col overflow-hidden">
      <SettingsItem
        :title="$t('setting.muted.title')"
        to="/settings/muted"
        data-cy="username-settings-btn"
      />
      <SettingsItem
        :title="$t('setting.blocked.title')"
        to="/settings/blocked"
        data-cy="username-settings-btn"
      />
    </div>
  </div>
</template>
