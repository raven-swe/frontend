<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { updateProfileService } from '~/services/profile/updateProfileService';
import DiscardChangesDialog from '~/components/profile/edit/DiscardChangesDialog.vue';
import useDateSelect from '@/composables/useDateSelect';
import { VisuallyHidden } from 'reka-ui';

definePageMeta({
  layout: 'profile',
});
const route = useRoute();
const router = useRouter();

// Control dialog open state based on current route
const isDialogOpen = computed(() => route.path === '/settings/profile');
const openDiscardDialog = ref(false);

const userStore = useUserStore().user;
const { updateProfile, updateProfilePicture, updateHeaderImage, removeHeaderImage } =
  updateProfileService();

const bannerFileInput = ref<HTMLInputElement | null>(null);
const profileFileInput = ref<HTMLInputElement | null>(null);

// Initialize with existing user data
const selectedImage = ref<string | null>(userStore.bannerUrl || null);
const selectedProfileImage = ref<string | null>(userStore.avatarUrl || null);
const name = ref<string>(userStore.displayName || '');
const bio = ref<string>(userStore.bio || '');
const location = ref<string>(userStore.location || '');
const website = ref<string>(userStore.websiteUrl || '');

// Add birth date handling
const birthDate = ref<Date | undefined>(
  userStore.birthDate ? new Date(userStore.birthDate) : undefined,
);
// Initialize date selector with existing birth date
const dateSelect = useDateSelect(
  new Date().getFullYear() - 100,
  new Date().getFullYear(),
  birthDate.value,
);
watch(
  [dateSelect.selectedDay, dateSelect.selectedMonth, dateSelect.selectedYear],
  ([day, month, year]) => {
    if (day && month && year) {
      const newBirthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (newBirthDate.getDate() === Number(day)) {
        birthDate.value = newBirthDate;
      }
    }
  },
);

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

const handleRemoveHeaderImage = () => {
  selectedImage.value = null;
  if (bannerFileInput.value) {
    bannerFileInput.value.value = '';
  }
};

const hasUnsavedChanges = computed(() => {
  return (
    name.value !== userStore.displayName ||
    bio.value !== userStore.bio ||
    location.value !== userStore.location ||
    website.value !== userStore.websiteUrl ||
    selectedProfileImage.value !== userStore.avatarUrl ||
    selectedImage.value !== userStore.bannerUrl ||
    (birthDate.value &&
      userStore.birthDate &&
      birthDate.value.getTime() !== new Date(userStore.birthDate).getTime()) ||
    (!birthDate.value && userStore.birthDate) ||
    (birthDate.value && !userStore.birthDate)
  );
});

const isFormValid = computed(() => {
  return name.value.trim() !== '';
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  router.push(`/profile/${userStore.username}`); // optimistically navigate away

  if (!hasUnsavedChanges.value) return;

  // Sync updates
  if (!selectedImage.value && userStore.bannerUrl) {
    await removeHeaderImage();
  } else if (bannerFileInput.value?.files?.[0]) {
    await updateHeaderImage(bannerFileInput.value.files[0]);
    // using the response, update the store with the new avatarUrl
  }

  if (profileFileInput.value?.files?.[0]) {
    await updateProfilePicture(profileFileInput.value.files[0]);
    // using the response, update the store with the new bannerUrl
  }

  const formattedBirthDate = birthDate.value
    ? birthDate.value.toISOString().split('T')[0]
    : undefined;

  // at least one of the text fields has changed
  await updateProfile({
    displayName: name.value,
    bio: bio.value,
    location: location.value,
    websiteUrl: website.value,
    birthDate: formattedBirthDate,
  });

  // refresh user store data
  useUserStore().updateUser({
    displayName: name.value,
    bio: bio.value,
    location: location.value,
    websiteUrl: website.value,
    birthDate: formattedBirthDate,
    avatarUrl: selectedProfileImage.value || userStore.avatarUrl,
    bannerUrl: selectedImage.value || userStore.bannerUrl,
  });
};

const handleDiscard = () => {
  openDiscardDialog.value = false;
  router.push(`/profile/${userStore.username}`);
};

const handleDialogClose = () => {
  if (!hasUnsavedChanges.value) {
    router.push(`/profile/${userStore.username}`);
    return;
  }
  openDiscardDialog.value = true;
};
</script>

<template>
  <div>
    <UiDialog :open="isDialogOpen">
      <UiDialogContent
        header-class="flex items-center justify-between px-4"
        class="h-auto !w-[600px] !max-w-[600px]"
        :hide-close-button="true"
      >
        <template #header>
          <div class="flex gap-3">
            <UiButton
              variant="ghost-default"
              size="icon-xs"
              class="hover:bg-muted-foreground/10"
              @click="handleDialogClose"
            >
              <Icon name="lucide:x" class="size-5" />
              <span class="sr-only">{{ $t('ui.close') }}</span>
            </UiButton>
            <h2 class="text-xl font-bold">{{ $t('profile.edit.edit-profile') }}</h2>
          </div>
          <UiButton class="w-16" size="xs" :disabled="!isFormValid" @click="handleSubmit">
            {{ $t('ui.save') }}
          </UiButton>
        </template>
        <UiDialogTitle>
          <VisuallyHidden>
            {{ $t('profile.edit.edit-profile') }}
          </VisuallyHidden>
        </UiDialogTitle>

        <div class="flex h-full w-full flex-col">
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
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
          </div>

          <!-- Profile Section -->
          <div class="relative z-10 -mt-12 mb-6 flex flex-col items-center gap-3 self-start px-3">
            <div class="relative">
              <img
                :src="selectedProfileImage || 'https://i.ibb.co/R498JgFW/img.webp'"
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
            <UiInput
              v-model="name"
              placeholder="Name"
              :class="isFormValid ? 'mb-6' : 'mb-1'"
              :aria-invalid="!isFormValid"
            />
            <p
              v-if="!isFormValid"
              class="text-destructive mb-6 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {{ $t('errors.EMPTY_NAME') }}
            </p>
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

            <!-- Birth Date Section -->
            <div class="mb-10">
              <h3 class="mb-2 font-medium">{{ $t('profile.edit.birth-date') }}</h3>
              <div class="flex gap-2">
                <uiSelect
                  v-model="dateSelect.selectedMonth.value"
                  class="flex-1"
                  :options="dateSelect.months.value"
                  placeholder="Month"
                  name="birth-month"
                />
                <uiSelect
                  v-model="dateSelect.selectedDay.value"
                  class="flex-1"
                  :options="dateSelect.days.value"
                  placeholder="Day"
                  name="birth-day"
                />
                <uiSelect
                  v-model="dateSelect.selectedYear.value"
                  class="flex-1"
                  :options="dateSelect.years.value"
                  placeholder="Year"
                  name="birth-year"
                />
              </div>
            </div>
          </div>
        </div>

        <UiDialogFooter />
      </UiDialogContent>
    </UiDialog>

    <DiscardChangesDialog
      :open="openDiscardDialog"
      @discard="handleDiscard"
      @cancel="openDiscardDialog = false"
    />
  </div>
</template>
