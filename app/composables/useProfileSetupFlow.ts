import { ref, computed } from 'vue';

type SetupStep = 'picture' | 'bio' | 'location' | 'complete';

interface ProfileSetupData {
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
}

export const useProfileSetupFlow = () => {
  const currentStep = ref<SetupStep>('picture');
  const isFlowActive = ref(true);

  const formData = ref<ProfileSetupData>({
    profilePicture: null,
    bio: '',
    location: '',
  });

  const stepOrder: SetupStep[] = ['picture', 'bio', 'location', 'complete'];

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

  const setProfilePicture = (image: string | null) => {
    formData.value.profilePicture = image;
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
  };

  const resetFlow = () => {
    formData.value = {
      profilePicture: null,
      bio: '',
      location: '',
    };
    currentStep.value = 'picture';
    isFlowActive.value = false;
  };

  const submitProfile = async () => {
    // API call to save all data
    console.log('Final profile data:', formData.value);

    // After successful submission
    resetFlow();
  };

  // Computed properties for checking which dialog should be open
  const isProfilePictureDialogOpen = computed(
    () => isFlowActive.value && currentStep.value === 'picture',
  );

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
    isBioDialogOpen,
    isLocationDialogOpen,
    isConfirmationDialogOpen,

    // Methods
    startFlow,
    nextStep,
    setProfilePicture,
    setBio,
    setLocation,
    closeFlow,
    resetFlow,
    submitProfile,
  };
};
