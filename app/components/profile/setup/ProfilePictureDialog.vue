<script lang="ts" setup>
import type { buttonVariants } from '~~/shared/types/ui';

const props = defineProps<{
  open: boolean;
}>();

interface Emits {
  (e: 'submit', data: { file: File | null; dataUrl: string | null }): void;
  (e: 'update:open', value: boolean): void;
}
const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

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
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = () => {
  emit('submit', {
    file: selectedFile.value,
    dataUrl: selectedImage.value,
  });
};

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
  if (!value) {
    // Reset on close
    selectedImage.value = null;
    selectedFile.value = null;
  }
};
</script>

<template>
  <UiDialog :open="props.open" @update:open="handleOpenChange">
    <UiDialogContent header-class="flex items-center justify-center p-0" class="h-auto">
      <template #header>
        <img src="https://placehold.co/32x32" class="size-8" />
      </template>
      <UiDialogHeader class="px-8 py-4">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.setup.pick-profile-picture')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.setup.profile-picture-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <div class="mx-2 flex flex-grow items-center justify-center">
        <div class="relative">
          <img
            :src="selectedImage || 'https://cdn.raven.cmp27.space/default_avatar.png'"
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
        <UiButton :variant="actionButton.variant" class="w-100" size="xl" @click="handleSubmit">
          {{ actionButton.text }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
