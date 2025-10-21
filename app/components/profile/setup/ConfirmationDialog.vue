<script setup lang="ts">
import { VisuallyHidden } from 'reka-ui';

const handleSave = () => {
  // eslint-disable-next-line no-console
  console.log('Profile updates saved');
};
</script>

<template>
  <div>
    <UiDialog>
      <UiDialogTrigger as-child>
        <UiButton variant="outline" size="sm">
          {{ $t('profile.setup.setup-profile') }}
        </UiButton>
      </UiDialogTrigger>
      <UiDialogContent class="h-auto">
        <UiDialogTitle>
          <VisuallyHidden>{{ $t('profile.setup.confirmation-dialog') }}</VisuallyHidden>
        </UiDialogTitle>
        <UiDialogDescription aria-describedby="undefined" />
        <div class="m-auto flex flex-col items-center justify-center gap-6">
          <img src="https://placehold.co/48" />
          <p class="text-2xl font-bold">{{ $t('profile.setup.click-to-save') }}</p>
          <UiButton class="w-65" size="xl" @click="handleSave">
            {{ $t('ui.save') }}
          </UiButton>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
