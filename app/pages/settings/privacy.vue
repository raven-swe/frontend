<script lang="ts" setup>
import SettingsItem from '~/components/Settings/SettingsItem.vue';
</script>

<template>
  <div>
    <div class="p-4">
      <h1 class="h-8.5 text-2xl font-bold">{{ $t('setting.privacy-settings.title') }}</h1>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.privacy-settings.description') }}
      </p>
    </div>
    <div class="mt-3 flex flex-col gap-3 overflow-hidden">
      <SettingsItem
        :title="$t('setting.mute-and-block.title')"
        :subtitle="$t('setting.mute-and-block.description')"
        to="/settings/mute-and-block"
        data-cy="username-settings-btn"
        icon="lucide:volume-off"
      />
    </div>
  </div>
</template>
