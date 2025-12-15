<script lang="ts" setup>
import { settingSections } from '~/constants/settings-section';
</script>
<template>
  <div>
    <h2 class="px-4 py-3 text-2xl font-bold">
      {{ $t('setting.settings') }}
    </h2>
    <div class="mt-3 flex flex-col">
      <NuxtLink
        v-for="settingSetion in settingSections"
        :key="settingSetion.route"
        :data-cy="settingSetion.cy"
        class="text-md hover:bg-accent flex cursor-pointer items-center justify-between border-e-2 border-transparent px-4 py-3 transition-colors"
        :to="settingSetion.route"
        active-class="border-e-primary bg-accent"
      >
        <div class="flex flex-col">
          <span class="text-lg leading-tight">{{ $t(settingSetion.title) }}</span>
        </div>
        <Icon :name="$t('setting.item-icon')" size="1.2rem" class="text-muted-foreground" />
      </NuxtLink>
    </div>
  </div>
</template>
