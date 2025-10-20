<script lang="ts" setup>
import type { buttonVariants } from '~~/types/ui';

const actionButton = computed(() => {
  const isLocationSet = false;
  return {
    text: isLocationSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isLocationSet ? 'primary' : 'outline') as buttonVariants,
  };
});
</script>

<template>
  <div>
    <div class="p-4"></div>
    <div class="flex flex-col items-start gap-4 p-8">
      <UiDialog>
        <UiDialogTrigger as-child>
          <UiButton variant="outline" size="sm">
            {{ $t('profile.setup.setup-profile') }}
          </UiButton>
        </UiDialogTrigger>
        <UiDialogContent header-class="flex items-center justify-center p-0" class="h-auto">
          <template #header>
            <img src="https://placehold.co/32x32" class="size-8" />
          </template>
          <UiDialogHeader class="px-8 py-4">
            <UiDialogTitle class="text-3xl font-bold">{{
              $t('profile.setup.add-location')
            }}</UiDialogTitle>
            <!--  -->
            <UiDialogDescription>
              {{ $t('profile.setup.location-desc') }}
            </UiDialogDescription>
          </UiDialogHeader>
          <div class="mx-2 flex flex-grow items-center justify-center">
            <uiInput type="text" placeholder="location" class="w-full max-w-md" maxlength="30" />
          </div>
          <UiDialogFooter>
            <UiButton :variant="actionButton.variant" class="w-100" size="xl">
              {{ actionButton.text }}
            </UiButton>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>
    </div>
  </div>
</template>
