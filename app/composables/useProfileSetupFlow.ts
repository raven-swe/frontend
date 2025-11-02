import { computed } from 'vue';
import { updateProfileService } from '~/services/profile/updateProfileService';
import { useQueryClient } from '@tanstack/vue-query';

type SetupStep = 'picture' | 'header' | 'bio' | 'location' | 'complete';

interface ProfileSetupData {
  profilePicture: File | null;
  avatarUrl: string | null;
  header: File | null;
  bio: string | null;
  location: string | null;
}

export const useProfileSetupFlow = () => {
  const currentStep = useState<SetupStep>('profileSetup-currentStep', () => 'picture');
  const isFlowActive = useState('profileSetup-isFlowActive', () => true);
  const queryClient = useQueryClient();
  const userStore = useUserStore();

  const formData = useState<ProfileSetupData>('profileSetup-formData', () => ({
    profilePicture: null,
    avatarUrl: null,
    header: null,
    bio: '',
    location: '',
  }));

  const { updateProfile, updateProfilePicture, updateHeaderImage } = updateProfileService();

  const stepOrder: SetupStep[] = ['picture', 'header', 'bio', 'location', 'complete'];

  const startFlow = () => {
    isFlowActive.value = true;
    currentStep.value = 'picture';
  };

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep.value);
    if (currentIndex < stepOrder.length - 1) {
      currentStep.value = stepOrder[currentIndex + 1]!;
    }
  };

  const setProfilePicture = (image: File | null) => {
    formData.value.profilePicture = image;
  };

  const setAvatarUrl = (url: string | null) => {
    formData.value.avatarUrl = url;
  };

  const setHeader = (header: File | null) => {
    formData.value.header = header;
  };

  const setBio = (bio: string | null) => {
    formData.value.bio = bio;
  };

  const setLocation = (location: string | null) => {
    formData.value.location = location;
  };

  const closeFlow = () => {
    isFlowActive.value = false;
    currentStep.value = 'picture';
    // nav to profile page
    const userStore = useUserStore();
    navigateTo(`/profile/${userStore.user.username}`);
  };

  const resetFlow = () => {
    formData.value = {
      profilePicture: null,
      avatarUrl: null,
      header: null,
      bio: '',
      location: '',
    };
    currentStep.value = 'picture';
    isFlowActive.value = false;
  };

  const submitProfile = async () => {
    try {
      // Update profile picture if provided
      if (formData.value.profilePicture) {
        await updateProfilePicture(formData.value.profilePicture);
      }

      // Update header image if provided
      if (formData.value.header) {
        await updateHeaderImage(formData.value.header);
      }

      // Update bio and location
      if (formData.value.bio || formData.value.location) {
        await updateProfile({
          bio: formData.value.bio || undefined,
          location: formData.value.location || undefined,
        });
      }

      // console.log('Profile setup completed successfully!');
    } catch (error) {
      console.error('Failed to submit profile:', error);
    } finally {
      // After successful submission
      resetFlow();
      // refresh data
      queryClient.invalidateQueries({ queryKey: ['layout-data'] });
      queryClient.invalidateQueries({ queryKey: ['profile', userStore.user.username] });
    }
  };

  // Computed properties for checking which dialog should be open
  const isProfilePictureDialogOpen = computed(
    () => isFlowActive.value && currentStep.value === 'picture',
  );

  const isHeaderDialogOpen = computed(() => isFlowActive.value && currentStep.value === 'header');

  const isBioDialogOpen = computed(() => isFlowActive.value && currentStep.value === 'bio');

  const isLocationDialogOpen = computed(
    () => isFlowActive.value && currentStep.value === 'location',
  );

  const isConfirmationDialogOpen = computed(
    () => isFlowActive.value && currentStep.value === 'complete',
  );

  return {
    // State
    currentStep,
    isFlowActive,
    formData,

    // Computed
    isProfilePictureDialogOpen,
    isHeaderDialogOpen,
    isBioDialogOpen,
    isLocationDialogOpen,
    isConfirmationDialogOpen,

    // Methods
    startFlow,
    nextStep,
    setProfilePicture,
    setAvatarUrl,
    setHeader,
    setBio,
    setLocation,
    closeFlow,
    resetFlow,
    submitProfile,
  };
};
