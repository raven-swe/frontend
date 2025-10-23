<script setup lang="ts">
definePageMeta({
  layout: 'profile',
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const profileFileInputRef = ref<HTMLInputElement | null>(null);

// Update with actual user data fetching logic afte user auth is done
const selectedImage = ref<string | null>(null);
const selectedProfileImage = ref<string | null>(null);
const name = ref<string>('habibayman');
const bio = ref<string>(
  "Fourth year Computer Engineering student @ Cairo university || GSoC25\nI'm only here when the reels get boring on ig",
);
const location = ref<string>('Cairo, Egypt');
const website = ref<string>('https://github.com/habibayman');

const handleImageClick = () => {
  fileInputRef.value?.click();
};

const handleProfileImageClick = () => {
  profileFileInputRef.value?.click();
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

const handleProfileFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedProfileImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};
</script>

<template>
  <UiDialog :open="true">
    <UiDialogContent
      header-class="flex items-center justify-center p-0"
      class="h-auto !w-[650px] !max-w-[650px] overflow-y-auto"
    >
      <template #header>
        <img src="https://placehold.co/32x32" class="size-8" />
      </template>
      <UiDialogHeader class="px-8 py-4">
        <UiDialogTitle class="text-3xl font-bold">{{
          $t('profile.setup.pick-header')
        }}</UiDialogTitle>
        <UiDialogDescription>
          {{ $t('profile.setup.header-desc') }}
        </UiDialogDescription>
      </UiDialogHeader>
      <!-- Header Image Section - Full Width -->
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
      <!-- Profile Section -->
      <div class="relative z-10 -mt-12 flex flex-col items-center gap-3 self-start px-3">
        <div class="relative">
          <img
            :src="selectedProfileImage || '/default_profile.png'"
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
            ref="profileFileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleProfileFileChange"
          />
        </div>
      </div>
      <!-- Inputs -->
      <div class="w-full px-4">
        <UiInput v-model="name" placeholder="Name" class="mb-6" />
        <uiInput
          v-model="bio"
          type="textarea"
          :rows="2"
          placeholder="Bio"
          class="mb-6 w-full"
          maxlength="160"
        />
        <uiInput
          v-model="location"
          type="text"
          placeholder="location"
          class="mb-6 w-full"
          maxlength="30"
        />
        <uiInput
          v-model="website"
          type="text"
          placeholder="website"
          class="mb-6 w-full"
          maxlength="100"
        />
        <!-- date picker component should go here -->
      </div>
      <UiDialogFooter />
    </UiDialogContent>
  </UiDialog>
</template>
