<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { updateProfileService } from '~/services/profile/updateProfileService';

definePageMeta({
  layout: 'profile',
});
const route = useRoute();
const router = useRouter();

// Control dialog open state based on route
const isDialogOpen = computed(() => route.path === '/settings/profile');

const userStore = useUserStore().user;
const { updateProfile, updateProfilePicture, updateHeaderImage } = updateProfileService();

const bannerFileInput = ref<HTMLInputElement | null>(null);
const profileFileInput = ref<HTMLInputElement | null>(null);

// Initialize with existing user data
const selectedImage = ref<string | null>(userStore.bannerUrl || null);
const selectedProfileImage = ref<string | null>(userStore.avatarUrl || null);
const name = ref<string>(userStore.displayName || '');
const bio = ref<string>(userStore.bio || '');
const location = ref<string>(userStore.location || '');
const website = ref<string>(userStore.websiteUrl || '');

const handleImageClick = () => {
  bannerFileInput.value?.click();
};

const handleProfileImageClick = () => {
  profileFileInput.value?.click();
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

const hasUnsavedChanges = computed(() => {
  return (
    name.value !== userStore.displayName ||
    bio.value !== userStore.bio ||
    location.value !== userStore.location ||
    website.value !== userStore.websiteUrl ||
    selectedProfileImage.value !== userStore.avatarUrl ||
    selectedImage.value !== userStore.bannerUrl
  );
});

const handleSubmit = async () => {
  handleDialogClose();
  if (!hasUnsavedChanges.value) return;

  // send all the data to be updated
  if (bannerFileInput.value?.files?.[0]) {
    console.log('updating banner image');
    await updateHeaderImage(bannerFileInput.value.files[0]);
  }

  if (profileFileInput.value?.files?.[0]) {
    await updateProfilePicture(profileFileInput.value.files[0]);
  }

  // at least one of the text fields has changed
  await updateProfile({
    displayName: name.value,
    bio: bio.value,
    location: location.value,
    websiteUrl: website.value,
  });
};

const handleDialogClose = () => {
  router.push('/profile/');
};
</script>

<template>
  <UiDialog :open="isDialogOpen">
    <UiDialogContent
      header-class="flex items-center justify-between px-4"
      class="h-auto !w-[650px] !max-w-[650px] !p-0"
    >
      <template #header>
        <h2 class="text-xl font-bold">{{ $t('profile.edit.edit-profile') }}</h2>
        <UiButton class="w-16" size="xs" @click="handleSubmit">{{ $t('ui.save') }}</UiButton>
      </template>

      <div class="flex h-full w-full flex-col">
        <UiDialogHeader>
          <UiDialogTitle />
          <UiDialogDescription />
        </UiDialogHeader>

        <!-- Header Image Section -->
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
            ref="bannerFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <!-- Profile Section -->
        <div class="relative z-10 -mt-12 mb-6 flex flex-col items-center gap-3 self-start px-3">
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
              ref="profileFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleProfileFileChange"
            />
          </div>
        </div>

        <!-- Inputs Section -->
        <div class="w-full px-4 pb-6">
          <UiInput v-model="name" placeholder="Name" class="mb-6" />
          <uiInput
            v-model="bio"
            type="textarea"
            :rows="2"
            :placeholder="$t('profile.edit.bio')"
            class="mb-6 w-full"
            maxlength="160"
          />
          <uiInput
            v-model="location"
            type="text"
            :placeholder="$t('profile.edit.location')"
            class="mb-6 w-full"
            maxlength="30"
          />
          <uiInput
            v-model="website"
            type="text"
            :placeholder="$t('profile.edit.website')"
            class="mb-6 w-full"
            maxlength="100"
          />
          <!-- date picker component should go here -->
        </div>
      </div>

      <UiDialogFooter />
    </UiDialogContent>
  </UiDialog>
</template>
