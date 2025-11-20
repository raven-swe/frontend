<script setup lang="ts">
interface Props {
  selectedProfileImage: string | null;
}

interface Emits {
  (e: 'update:selectedProfileImage', value: string | null): void;
  (e: 'fileChange', event: Event): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const profileFileInput = ref<HTMLInputElement | null>(null);

const handleProfileImageClick = () => {
  profileFileInput.value?.click();
};

const handleProfileFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emit('update:selectedProfileImage', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  emit('fileChange', event);
};

defineExpose({
  fileInput: profileFileInput,
});
</script>

<template>
  <div class="relative z-10 -mt-12 mb-6 flex flex-col items-center gap-3 self-start px-3">
    <div class="relative">
      <img
        :src="selectedProfileImage || 'https://cdn.raven.cmp27.space/default_avatar.png'"
        class="h-30 w-30 cursor-pointer rounded-full border-3 border-white object-cover"
        @click="handleProfileImageClick"
      />
      <button
        type="button"
        class="bg-foreground/60 hover:bg-foreground/80 absolute start-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
        @click="handleProfileImageClick"
      >
        <Icon name="lucide:camera" class="text-white" size="1rem" />
      </button>
      <input
        ref="profileFileInput"
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        class="hidden"
        @change="handleProfileFileChange"
      />
    </div>
  </div>
</template>
