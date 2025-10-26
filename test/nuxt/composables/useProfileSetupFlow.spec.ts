import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Ref } from 'vue';
import { nextTick } from 'vue';
import type { useProfileSetupFlow as useProfileSetupFlowType } from '~/composables/useProfileSetupFlow';

// Mock useState
type SetupStep = 'picture' | 'header' | 'bio' | 'location' | 'complete';

const mockState = {
  currentStep: { value: 'picture' } as Ref<SetupStep>,
  isFlowActive: { value: true } as Ref<boolean>,
  formData: {
    value: {
      profilePicture: null as File | null,
      avatarUrl: null as string | null,
      header: null as File | null,
      bio: '' as string | null,
      location: '' as string | null,
    },
  },
};

vi.mock('#app', () => ({
  useState: vi.fn((key: string) => {
    if (key === 'profileSetup-currentStep') return mockState.currentStep;
    if (key === 'profileSetup-isFlowActive') return mockState.isFlowActive;
    if (key === 'profileSetup-formData') return mockState.formData;
  }),
}));

// Mock updateProfileService
const mockUpdateProfile = vi.fn();
const mockUpdateProfilePicture = vi.fn();
const mockUpdateHeaderImage = vi.fn();

vi.mock('~/services/profile/updateProfileService', () => ({
  updateProfileService: () => ({
    updateProfile: mockUpdateProfile,
    updateProfilePicture: mockUpdateProfilePicture,
    updateHeaderImage: mockUpdateHeaderImage,
  }),
}));

describe('useProfileSetupFlow', () => {
  let useProfileSetupFlow: typeof useProfileSetupFlowType;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockState.currentStep.value = 'picture';
    mockState.isFlowActive.value = true;
    mockState.formData.value = {
      profilePicture: null,
      avatarUrl: null,
      header: null,
      bio: '',
      location: '',
    };
    mockUpdateProfile.mockResolvedValue(undefined);
    mockUpdateProfilePicture.mockResolvedValue(undefined);
    mockUpdateHeaderImage.mockResolvedValue(undefined);

    // Dynamically import a fresh instance for each test
    const mod = await vi.importActual<typeof import('~/composables/useProfileSetupFlow')>(
      '~/composables/useProfileSetupFlow',
    );
    useProfileSetupFlow = mod.useProfileSetupFlow;
  });

  it('initializes with correct default values', () => {
    const { currentStep, isFlowActive, formData } = useProfileSetupFlow();

    expect(currentStep.value).toBe('picture');
    expect(isFlowActive.value).toBe(true);
    expect(formData.value).toEqual({
      profilePicture: null,
      avatarUrl: null,
      header: null,
      bio: '',
      location: '',
    });
  });

  it('startFlow sets flow to active and resets to first step', () => {
    mockState.currentStep.value = 'bio';
    mockState.isFlowActive.value = false;

    const { startFlow, currentStep, isFlowActive } = useProfileSetupFlow();
    startFlow();

    expect(isFlowActive.value).toBe(true);
    expect(currentStep.value).toBe('picture');
  });

  it('nextStep advances to next step', () => {
    const { nextStep, currentStep } = useProfileSetupFlow();

    nextStep();
    expect(currentStep.value).toBe('header');

    nextStep();
    expect(currentStep.value).toBe('bio');

    nextStep();
    expect(currentStep.value).toBe('location');

    nextStep();
    expect(currentStep.value).toBe('complete');
  });

  it('nextStep does not advance beyond last step', () => {
    mockState.currentStep.value = 'complete';

    const { nextStep, currentStep } = useProfileSetupFlow();
    nextStep();

    expect(currentStep.value).toBe('complete');
  });

  it('setProfilePicture updates formData', () => {
    const { setProfilePicture, formData } = useProfileSetupFlow();
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    setProfilePicture(file);

    expect(formData.value.profilePicture).toEqual(file);
  });

  it('setAvatarUrl updates formData', () => {
    const { setAvatarUrl, formData } = useProfileSetupFlow();
    const url = 'https://example.com/avatar.png';

    setAvatarUrl(url);

    expect(formData.value.avatarUrl).toBe(url);
  });

  it('setHeader updates formData', () => {
    const { setHeader, formData } = useProfileSetupFlow();
    const file = new File(['header'], 'header.png', { type: 'image/png' });

    setHeader(file);

    expect(formData.value.header).toEqual(file);
  });

  it('setBio updates formData', () => {
    const { setBio, formData } = useProfileSetupFlow();
    const bio = 'Test bio';

    setBio(bio);

    expect(formData.value.bio).toBe(bio);
  });

  it('setLocation updates formData', () => {
    const { setLocation, formData } = useProfileSetupFlow();
    const location = 'Test location';

    setLocation(location);

    expect(formData.value.location).toBe(location);
  });

  it('closeFlow deactivates flow and resets step', () => {
    mockState.currentStep.value = 'bio';

    const { closeFlow, currentStep, isFlowActive } = useProfileSetupFlow();
    closeFlow();

    expect(isFlowActive.value).toBe(false);
    expect(currentStep.value).toBe('picture');
  });

  it('resetFlow clears all data and deactivates flow', () => {
    mockState.formData.value = {
      profilePicture: new File(['test'], 'test.png'),
      avatarUrl: 'test-url',
      header: new File(['header'], 'header.png'),
      bio: 'test bio',
      location: 'test location',
    };

    const { resetFlow, currentStep, isFlowActive, formData } = useProfileSetupFlow();
    resetFlow();

    expect(formData.value).toEqual({
      profilePicture: null,
      avatarUrl: null,
      header: null,
      bio: '',
      location: '',
    });
    expect(currentStep.value).toBe('picture');
    expect(isFlowActive.value).toBe(false);
  });

  it('submitProfile calls updateProfilePicture when profilePicture is provided', async () => {
    const { setProfilePicture, submitProfile } = useProfileSetupFlow();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    setProfilePicture(file);

    await submitProfile();

    expect(mockUpdateProfilePicture).toHaveBeenCalledWith(file);
  });

  it('submitProfile calls updateHeaderImage when header is provided', async () => {
    const { setHeader, submitProfile } = useProfileSetupFlow();
    const file = new File(['header'], 'header.png', { type: 'image/png' });
    setHeader(file);

    await submitProfile();

    expect(mockUpdateHeaderImage).toHaveBeenCalledWith(file);
  });

  it('submitProfile calls updateProfile when bio or location is provided', async () => {
    const { setBio, setLocation, submitProfile } = useProfileSetupFlow();
    setBio('test bio');
    setLocation('test location');

    await submitProfile();

    expect(mockUpdateProfile).toHaveBeenCalledWith({
      bio: 'test bio',
      location: 'test location',
    });
  });

  it('submitProfile resets flow after successful submission', async () => {
    const { submitProfile, formData, isFlowActive } = useProfileSetupFlow();

    await submitProfile();

    expect(formData.value).toEqual({
      profilePicture: null,
      avatarUrl: null,
      header: null,
      bio: '',
      location: '',
    });
    expect(isFlowActive.value).toBe(false);
  });

  it('submitProfile resets flow even when services fail', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Update failed'));
    const { setBio, submitProfile, isFlowActive } = useProfileSetupFlow();
    setBio('test bio');

    await submitProfile();

    expect(isFlowActive.value).toBe(false);
  });

  it('computed properties return correct values', async () => {
    const {
      currentStep,
      isFlowActive,
      isProfilePictureDialogOpen,
      isHeaderDialogOpen,
      isBioDialogOpen,
      isLocationDialogOpen,
      isConfirmationDialogOpen,
      nextStep,
    } = useProfileSetupFlow();

    isFlowActive.value = true;
    currentStep.value = 'picture';
    await nextTick();
    expect(isProfilePictureDialogOpen.value).toBe(true);
    expect(isHeaderDialogOpen.value).toBe(false);

    nextStep();
    await nextTick();
    expect(isHeaderDialogOpen.value).toBe(true);

    nextStep();
    await nextTick();
    expect(isBioDialogOpen.value).toBe(true);

    nextStep();
    await nextTick();
    expect(isLocationDialogOpen.value).toBe(true);

    nextStep();
    await nextTick();
    expect(isConfirmationDialogOpen.value).toBe(true);
  });

  it('computed properties return false when flow is inactive', async () => {
    const { isProfilePictureDialogOpen, isHeaderDialogOpen, isFlowActive } = useProfileSetupFlow();
    isFlowActive.value = false;
    await nextTick();

    expect(isProfilePictureDialogOpen.value).toBe(false);
    expect(isHeaderDialogOpen.value).toBe(false);
  });
});
