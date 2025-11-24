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
  const selectedImage = ref<string | null>(null);
  const selectedProfileImage = ref<string | null>(null);
  const name = ref<string>('');
  const bio = ref<string>('');
  const location = ref<string>('');
  const website = ref<string>('');
  const birthDate = ref<Date | undefined>(undefined);

  watch(
    () => userStore.user,
    (user) => {
      if (!user) return;

      selectedImage.value = user.bannerUrl || null;
      selectedProfileImage.value = user.avatarUrl || null;

      name.value = user.displayName || '';
      bio.value = user.bio || '';
      location.value = user.location || '';
      website.value = user.websiteUrl || '';
      birthDate.value = user.birthDate ? new Date(user.birthDate) : undefined;
    },
    { immediate: true },
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

  const isNameValid = computed(() => name.value.trim() !== '');

  const isWebsiteValid = computed(() => {
    if (website.value.trim() === '') return true;
    try {
      const url = new URL(website.value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  });

  const isAgeValid = computed(() => {
    if (!birthDate.value) return true;

    const today = new Date();
    const bd = new Date(birthDate.value);
    let age = today.getUTCFullYear() - bd.getUTCFullYear();

    const hasNotHadBirthdayThisYear =
      today.getUTCMonth() < bd.getUTCMonth() ||
      (today.getUTCMonth() === bd.getUTCMonth() && today.getUTCDate() < bd.getUTCDate());

    if (hasNotHadBirthdayThisYear) {
      age--;
    }

    return age >= 13;
  });

  const isFormValid = computed(() => {
    return isNameValid.value && isAgeValid.value && isWebsiteValid.value;
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
      deleteAvatar: !selectedProfileImage.value && !!userStore.user.avatarUrl,
    };

    // Get files
    const bannerFile = bannerFileInput.value?.files?.[0];
    const profileFile = profileFileInput.value?.files?.[0];

    await updateProfile(profileData, profileFile, bannerFile);

    // refresh data
    queryClient.invalidateQueries({ queryKey: ['layout-data'] });
    queryClient.invalidateQueries({ queryKey: ['profile', userStore.user.username.toLowerCase()] });
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
    isAgeValid,
    isNameValid,
    isWebsiteValid,
    // Methods
    handleSubmit,
  };
};
