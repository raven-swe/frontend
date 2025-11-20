<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import DiscardChangesDialog from '~/components/profile/edit/DiscardChangesDialog.vue';
import EditProfileBanner from '~/components/profile/edit/EditProfileBanner.vue';
import EditProfileAvatar from '~/components/profile/edit/EditProfileAvatar.vue';
import EditProfileInfo from '~/components/profile/edit/EditProfileInfo.vue';
import { useEditProfile } from '@/composables/useEditProfile';
import { VisuallyHidden } from 'reka-ui';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// Control dialog open state based on current route
const isDialogOpen = computed(() => route.path === '/settings/profile');
const openDiscardDialog = ref(false);

// Use the profile form composable
const {
  bannerFileInput,
  profileFileInput,
  selectedImage,
  selectedProfileImage,
  name,
  bio,
  location,
  website,
  birthDate,
  hasUnsavedChanges,
  isFormValid,
  handleSubmit,
} = useEditProfile();

// Component refs for file inputs
const bannerUploadRef = ref<InstanceType<typeof EditProfileBanner> | null>(null);
const avatarUploadRef = ref<InstanceType<typeof EditProfileAvatar> | null>(null);

// Sync file input refs from child components
watch(bannerUploadRef, (newRef) => {
  if (newRef?.fileInput) {
    bannerFileInput.value = newRef.fileInput;
  }
});

watch(avatarUploadRef, (newRef) => {
  if (newRef?.fileInput) {
    profileFileInput.value = newRef.fileInput;
  }
});

const handleDiscard = () => {
  router.push(`/profile/${userStore.user.username}`);
};

const handleDialogClose = () => {
  if (!hasUnsavedChanges.value) {
    router.push(`/profile/${userStore.user.username}`);
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
          <EditProfileBanner
            ref="bannerUploadRef"
            v-model:selected-image="selectedImage"
            :file-input-ref="bannerFileInput"
          />

          <!-- Profile Avatar Section -->
          <EditProfileAvatar
            ref="avatarUploadRef"
            v-model:selected-profile-image="selectedProfileImage"
          />

          <!-- Inputs Section -->
          <EditProfileInfo
            v-model:name="name"
            v-model:bio="bio"
            v-model:location="location"
            v-model:website="website"
            v-model:birth-date="birthDate"
            :is-form-valid="isFormValid"
          />
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
