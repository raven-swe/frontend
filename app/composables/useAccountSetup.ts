import { updateProfileService } from '~/services/profile/updateProfileService';
import { accountSettingsService } from '~/services/settings/accountSettingsService';

export default function useAccountSetup() {
  const setupStep = useState<'profile-picture' | 'username' | 'interests' | 'follow-user' | null>(
    'account-setup-step',
    () => 'profile-picture',
  );
  const { updateProfilePicture } = updateProfileService();

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
      await accountSettingsService.updateUsername(username);
      goToNextStep();
    } catch (error) {
      console.error('Error updating username:', error);
      showToaster('error', 'Failed to update username. Please try again.');
    }
  }

  async function handleInterestsSubmit(interests: string[]) {
    try {
      await accountSettingsService.updateInterests(interests);
      setupStep.value = null;
      goToNextStep();
    } catch (error) {
      console.error('Error updating interests:', error);
      showToaster('error', 'Failed to update interests. Please try again.');
    }
  }

  return {
    setupStep,
    goToNextStep,
    handleProfilePictureSubmit,
    handleUsernameSubmit,
    handleInterestsSubmit,
  };
}
