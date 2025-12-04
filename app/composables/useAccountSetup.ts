import { updateProfileService } from '~/services/profile/updateProfileService';
import { settingsService } from '~/services/settingsService';

export default function useAccountSetup() {
  const setupStep = useState<'profile-picture' | 'username' | 'interests' | 'follow-user' | null>(
    'account-setup-step',
    () => null,
  );
  const { updateProfilePicture } = updateProfileService();

  const start = () => {
    setupStep.value = 'interests';
  };

  const isOpen = computed(() => setupStep.value !== null);

  const goToNextStep = () => {
    switch (setupStep.value) {
      case 'profile-picture':
        setupStep.value = 'username';
        break;
      case 'username':
        setupStep.value = 'interests';
        break;
      case 'interests':
        setupStep.value = 'follow-user';
        break;
      case 'follow-user':
        setupStep.value = null;
        break;
      default:
        break;
    }
  };

  function handleProfilePictureSubmit({ file }: { file: File | null }) {
    try {
      if (file) {
        updateProfilePicture(file);
      }
      goToNextStep();
    } catch {
      showToaster('error', 'Failed to upload profile picture. Please try again.');
    }
  }

  async function handleUsernameSubmit(username: string) {
    try {
      await settingsService.updateUsername(username);
      goToNextStep();
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else if (isApiError(error)) {
        showToaster(
          'error',
          error.data?.data?.error.message || 'Failed to update username. Please try again.',
        );
        return;
      }
    }
  }

  async function handleInterestsSubmit(interests: string[]) {
    try {
      await settingsService.updateInterests(interests);
      goToNextStep();
    } catch (error) {
      if (isApiValidationError(error)) {
        const errors = error.data?.data?.error.errors;
        return errors;
      } else if (isApiError(error)) {
        showToaster(
          'error',
          error.data?.data?.error.message || 'Failed to update interests. Please try again.',
        );
        return;
      }
    }
  }

  return {
    setupStep,
    goToNextStep,
    handleProfilePictureSubmit,
    handleUsernameSubmit,
    handleInterestsSubmit,
    start,
    isOpen,
  };
}
