import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { updateProfileService } from '~/services/profile/updateProfileService';

export interface ProfileFormData {
  name: string;
  bio: string;
  location: string;
  website: string;
  birthDate: Date | undefined;
  selectedImage: string | null;
  selectedProfileImage: string | null;
}

export const useEditProfile = () => {
  const userStore = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateProfile } = updateProfileService();

  const bannerFileInput = ref<HTMLInputElement | null>(null);
  const profileFileInput = ref<HTMLInputElement | null>(null);

  // Initialize with existing user data
  const selectedImage = ref<string | null>(userStore.user.bannerUrl || null);
  const selectedProfileImage = ref<string | null>(userStore.user.avatarUrl || null);
  const name = ref<string>(userStore.user.displayName || '');
  const bio = ref<string>(userStore.user.bio || '');
  const location = ref<string>(userStore.user.location || '');
  const website = ref<string>(userStore.user.websiteUrl || '');
  const birthDate = ref<Date | undefined>(
    userStore.user.birthDate ? new Date(userStore.user.birthDate) : undefined,
  );

  // Normalize empty values to null
  const normalize = (v: unknown): string | null =>
    v === undefined || v === null || v === '' ? null : String(v);

  const hasUnsavedChanges = computed(() => {
    // Check if new files are selected
    if (profileFileInput.value?.files?.[0] || bannerFileInput.value?.files?.[0]) {
      return true;
    }

    // Check text fields
    if (normalize(name.value) !== normalize(userStore.user.displayName)) return true;
    if (normalize(bio.value) !== normalize(userStore.user.bio)) return true;
    if (normalize(location.value) !== normalize(userStore.user.location)) return true;
    if (normalize(website.value) !== normalize(userStore.user.websiteUrl)) return true;

    // Check images (only if no new file is selected)
    if (normalize(selectedProfileImage.value) !== normalize(userStore.user.avatarUrl)) return true;
    if (normalize(selectedImage.value) !== normalize(userStore.user.bannerUrl)) return true;

    // Check birth date
    const currentBirthDate = birthDate.value ? birthDate.value.toISOString().split('T')[0] : null;
    const originalBirthDate = userStore.user.birthDate
      ? new Date(userStore.user.birthDate).toISOString().split('T')[0]
      : null;
    if (currentBirthDate !== originalBirthDate) return true;

    return false;
  });

  const isFormValid = computed(() => {
    return name.value.trim() !== '';
  });

  const handleSubmit = async () => {
    if (!isFormValid.value) return;
    if (!hasUnsavedChanges.value) {
      router.push(`/profile/${userStore.user.username}`);
      return;
    }

    // optimistic navigation
    router.push(`/profile/${userStore.user.username}`);
    await nextTick(); // allow DOM and route to update

    const formattedBirthDate = birthDate.value
      ? birthDate.value.toISOString().split('T')[0]
      : undefined;

    // Prepare profile data
    const profileData = {
      displayName: name.value,
      bio: normalize(bio.value),
      location: normalize(location.value),
      websiteUrl: normalize(website.value),
      birthDate: formattedBirthDate,
      deleteBanner: !selectedImage.value && !!userStore.user.bannerUrl,
    };

    // Get files
    const bannerFile = bannerFileInput.value?.files?.[0];
    const profileFile = profileFileInput.value?.files?.[0];

    await updateProfile(profileData, profileFile, bannerFile);

    // refresh data
    queryClient.invalidateQueries({ queryKey: ['layout-data'] });
    queryClient.invalidateQueries({ queryKey: ['profile', userStore.user.username] });
  };

  return {
    // Refs
    bannerFileInput,
    profileFileInput,
    selectedImage,
    selectedProfileImage,
    name,
    bio,
    location,
    website,
    birthDate,
    // Computed
    hasUnsavedChanges,
    isFormValid,
    // Methods
    handleSubmit,
  };
};
