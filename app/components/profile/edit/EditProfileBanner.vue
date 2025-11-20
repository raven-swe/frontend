<script setup lang="ts">
interface Props {
  selectedImage: string | null;
  fileInputRef: HTMLInputElement | null;
}

interface Emits {
  (e: 'update:selectedImage', value: string | null): void;
  (e: 'fileChange', event: Event): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const bannerFileInput = ref<HTMLInputElement | null>(null);

const handleImageClick = () => {
  bannerFileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emit('update:selectedImage', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  emit('fileChange', event);
};

const handleRemoveHeaderImage = () => {
  emit('update:selectedImage', null);
  if (bannerFileInput.value) {
    bannerFileInput.value.value = '';
  }
};

defineExpose({
  fileInput: bannerFileInput,
});
</script>

<template>
  <div class="relative w-full">
    <div
      v-if="!selectedImage"
      class="bg-muted-foreground/50 h-40 w-full cursor-pointer"
      @click="handleImageClick"
    />
    <img
      v-else
      :src="selectedImage"
      class="h-40 w-full cursor-pointer object-cover brightness-70 filter"
      @click="handleImageClick"
    />
    <div class="absolute start-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-3">
      <button
        type="button"
        class="bg-foreground/60 hover:bg-foreground/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        @click="handleImageClick"
      >
        <Icon name="lucide:camera" class="text-white" size="1.2rem" />
      </button>
      <button
        v-if="selectedImage"
        type="button"
        class="bg-foreground/60 hover:bg-foreground/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        @click="handleRemoveHeaderImage"
      >
        <Icon name="lucide:x" class="text-white" size="1.2rem" />
      </button>
    </div>
    <input
      ref="bannerFileInput"
      type="file"
      accept="image/png,image/jpg,image/jpeg"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
