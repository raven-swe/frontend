<script lang="ts" setup>
import SettingsItem from '~/components/Settings/SettingsItem.vue';

definePageMeta({ layout: 'settings' });
</script>

<template>
  <div>
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="flex bg-transparent lg:hidden"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.privacy-settings.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.privacy-settings.description') }}
      </p>
    </div>
    <div class="mt-3 flex flex-col gap-3 overflow-hidden">
      <SettingsItem
        :title="$t('setting.mute-and-block.title')"
        :subtitle="$t('setting.mute-and-block.description')"
        to="/settings/mute-and-block"
        data-cy="mutes-and-blocks-settings-btn"
        icon="lucide:volume-off"
      />
      <SettingsItem
        :title="$t('setting.content-you-see.title')"
        :subtitle="$t('setting.content-you-see.description')"
        to="/settings/content-you-see"
        data-cy="content-you-see-settings-btn"
        icon="lucide:newspaper"
      />
    </div>
  </div>
</template>
