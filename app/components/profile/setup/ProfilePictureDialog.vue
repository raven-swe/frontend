<script lang="ts" setup>
import { ref } from 'vue';
import type { buttonVariants } from '~~/types/ui'; // Adjust import path as needed

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string | null>(null);
// const isDefaultImage = ref(true);

const actionButton = computed(() => {
  const hasImage = !!selectedImage.value;
  return {
    text: hasImage ? $t('ui.next') : $t('ui.skip-for-now'),
    variant: (hasImage ? 'primary' : 'outline') as buttonVariants,
  };
});

const handleImageClick = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
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
              $t('profile.setup.pick-profile-picture')
            }}</UiDialogTitle>
            <!--  -->
            <UiDialogDescription>
              {{ $t('profile.setup.profile-picture-desc') }}
            </UiDialogDescription>
          </UiDialogHeader>
          <div class="mx-2 flex flex-grow items-center justify-center">
            <div class="relative">
              <img
                :src="selectedImage || '/default_profile.png'"
                class="h-40 w-40 cursor-pointer rounded-full object-cover brightness-70 filter"
              />
              <button
                type="button"
                class="bg-foreground/60 hover:bg-foreground/80 absolute start-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                @click="handleImageClick"
              >
                <Icon name="lucide:camera" class="text-white" size="1.2rem" />
              </button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
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
