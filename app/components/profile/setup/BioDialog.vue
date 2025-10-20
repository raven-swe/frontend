<script lang="ts" setup>
import type { buttonVariants } from '~~/types/ui';

const bio = ref('');
const actionButton = computed(() => {
  const isBioSet = bio.value.trim().length > 0;
  return {
    text: isBioSet ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (isBioSet ? 'primary' : 'outline') as buttonVariants,
  };
});

const handleSubmit = () => {
  // eslint disable-next-line no-console
  console.log('Bio submitted:', bio.value);
};
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
              $t('profile.setup.enter-bio')
            }}</UiDialogTitle>
            <!--  -->
            <UiDialogDescription>
              {{ $t('profile.setup.bio-desc') }}
            </UiDialogDescription>
          </UiDialogHeader>
          <div class="mx-2 mt-2 mb-auto p-4">
            <uiInput
              v-model="bio"
              type="text"
              placeholder="Your bio"
              class="w-full max-w-md"
              maxlength="160"
            />
          </div>
          <UiDialogFooter>
            <UiButton :variant="actionButton.variant" class="w-100" size="xl" @click="handleSubmit">
              {{ actionButton.text }}
            </UiButton>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>
    </div>
  </div>
</template>
