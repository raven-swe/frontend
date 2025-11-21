import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useEditProfile } from '@/composables/useEditProfile';

// Mock Vue utilities
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    nextTick: vi.fn(() => Promise.resolve()),
  };
});

// Mock dependencies
const mockUser = {
  username: 'testuser',
  displayName: 'Test User',
  bio: 'Test bio',
  location: 'Test location',
  websiteUrl: 'https://example.com',
  birthDate: '2000-01-01',
  avatarUrl: 'https://example.com/avatar.jpg',
  bannerUrl: 'https://example.com/banner.jpg',
};

const mockUserStore = {
  user: { ...mockUser },
};

const mockRouter = {
  push: vi.fn(),
};

const mockQueryClient = {
  invalidateQueries: vi.fn(),
};

const mockUpdateProfileService = {
  updateProfile: vi.fn().mockResolvedValue({}),
};

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => mockUserStore),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => mockRouter),
}));

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: vi.fn(() => mockQueryClient),
}));

vi.mock('~/services/profile/updateProfileService', () => ({
  updateProfileService: vi.fn(() => mockUpdateProfileService),
}));

describe('useEditProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset user store to default state
    mockUserStore.user = { ...mockUser };
    mockRouter.push.mockClear();
    mockQueryClient.invalidateQueries.mockClear();
    mockUpdateProfileService.updateProfile.mockClear();
  });

  it('initializes with user data from store', () => {
    const { name, bio, location, website, birthDate, selectedImage, selectedProfileImage } =
      useEditProfile();

    expect(name.value).toBe('Test User');
    expect(bio.value).toBe('Test bio');
    expect(location.value).toBe('Test location');
    expect(website.value).toBe('https://example.com');
    expect(birthDate.value).toEqual(new Date('2000-01-01'));
    expect(selectedImage.value).toBe('https://example.com/banner.jpg');
    expect(selectedProfileImage.value).toBe('https://example.com/avatar.jpg');
  });

  it('initializes with empty values when user has null data', () => {
    mockUserStore.user = {
      username: 'testuser',
      displayName: '',
      bio: '',
      location: '',
      websiteUrl: '',
      birthDate: '',
      avatarUrl: '',
      bannerUrl: '',
    };

    const { name, bio, location, website, birthDate, selectedImage, selectedProfileImage } =
      useEditProfile();

    expect(name.value).toBe('');
    expect(bio.value).toBe('');
    expect(location.value).toBe('');
    expect(website.value).toBe('');
    expect(birthDate.value).toBeUndefined();
    expect(selectedImage.value).toBeNull();
    expect(selectedProfileImage.value).toBeNull();
  });

  describe('validation', () => {
    it('validates name correctly', () => {
      const { name, isNameValid } = useEditProfile();

      name.value = '';
      expect(isNameValid.value).toBe(false);

      name.value = '   ';
      expect(isNameValid.value).toBe(false);

      name.value = 'John Doe';
      expect(isNameValid.value).toBe(true);
    });

    it('validates website URL correctly', () => {
      const { website, isWebsiteValid } = useEditProfile();

      website.value = '';
      expect(isWebsiteValid.value).toBe(true);

      website.value = 'https://example.com';
      expect(isWebsiteValid.value).toBe(true);

      website.value = 'http://example.com';
      expect(isWebsiteValid.value).toBe(true);

      website.value = 'invalid-url';
      expect(isWebsiteValid.value).toBe(false);

      website.value = 'ftp://example.com';
      expect(isWebsiteValid.value).toBe(false);
    });

    it('validates age correctly', () => {
      const { birthDate, isAgeValid } = useEditProfile();

      // No birth date should be valid
      birthDate.value = undefined;
      expect(isAgeValid.value).toBe(true);

      // 20 years old should be valid
      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
      birthDate.value = twentyYearsAgo;
      expect(isAgeValid.value).toBe(true);

      // 10 years old should be invalid
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      birthDate.value = tenYearsAgo;
      expect(isAgeValid.value).toBe(false);

      // Exactly 13 years old should be valid
      const thirteenYearsAgo = new Date();
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
      birthDate.value = thirteenYearsAgo;
      expect(isAgeValid.value).toBe(true);
    });

    it('validates form correctly', () => {
      const { name, birthDate, isFormValid } = useEditProfile();

      // Valid name and age
      name.value = 'John Doe';
      birthDate.value = new Date('2000-01-01');
      expect(isFormValid.value).toBe(true);

      // Invalid name
      name.value = '';
      expect(isFormValid.value).toBe(false);

      // Valid name, invalid age
      name.value = 'John Doe';
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      birthDate.value = tenYearsAgo;
      expect(isFormValid.value).toBe(false);
    });
  });

  describe('hasUnsavedChanges', () => {
    it('detects no changes initially', () => {
      const { hasUnsavedChanges } = useEditProfile();
      expect(hasUnsavedChanges.value).toBe(false);
    });

    it('detects changes in text fields', () => {
      const { name, bio, location, website, hasUnsavedChanges } = useEditProfile();

      name.value = 'Changed Name';
      expect(hasUnsavedChanges.value).toBe(true);

      name.value = 'Test User';
      bio.value = 'Changed bio';
      expect(hasUnsavedChanges.value).toBe(true);

      bio.value = 'Test bio';
      location.value = 'Changed location';
      expect(hasUnsavedChanges.value).toBe(true);

      location.value = 'Test location';
      website.value = 'https://changed.com';
      expect(hasUnsavedChanges.value).toBe(true);
    });

    it('detects changes in birth date', () => {
      const { birthDate, hasUnsavedChanges } = useEditProfile();

      birthDate.value = new Date('1995-06-15');
      expect(hasUnsavedChanges.value).toBe(true);

      birthDate.value = new Date('2000-01-01');
      expect(hasUnsavedChanges.value).toBe(false);
    });

    it('detects changes in selected images', () => {
      const { selectedImage, selectedProfileImage, hasUnsavedChanges } = useEditProfile();

      selectedImage.value = 'new-banner-url';
      expect(hasUnsavedChanges.value).toBe(true);

      selectedImage.value = 'https://example.com/banner.jpg';
      selectedProfileImage.value = 'new-avatar-url';
      expect(hasUnsavedChanges.value).toBe(true);
    });

    it('detects file uploads', () => {
      const { bannerFileInput, profileFileInput, hasUnsavedChanges } = useEditProfile();

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockFileInput = document.createElement('input') as HTMLInputElement;
      Object.defineProperty(mockFileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      bannerFileInput.value = mockFileInput;
      expect(hasUnsavedChanges.value).toBe(true);

      bannerFileInput.value = null;
      profileFileInput.value = mockFileInput;
      expect(hasUnsavedChanges.value).toBe(true);
    });

    it('handles null/empty value normalization correctly', () => {
      mockUserStore.user = { ...mockUser, bio: null };
      const { bio, hasUnsavedChanges } = useEditProfile();

      bio.value = '';
      expect(hasUnsavedChanges.value).toBe(false);

      bio.value = 'some content';
      expect(hasUnsavedChanges.value).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('does nothing if form is invalid', async () => {
      const { name, handleSubmit } = useEditProfile();

      name.value = '';

      await handleSubmit();

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockUpdateProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('navigates without updating if no changes', async () => {
      const { handleSubmit } = useEditProfile();

      await handleSubmit();

      expect(mockRouter.push).toHaveBeenCalledWith('/profile/testuser');
      expect(mockUpdateProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('updates profile with changes', async () => {
      const { name, bio, location, website, birthDate, handleSubmit } = useEditProfile();

      name.value = 'Updated Name';
      bio.value = 'Updated bio';
      location.value = 'Updated location';
      website.value = 'https://updated.com';
      birthDate.value = new Date('1995-06-15');

      await handleSubmit();

      expect(mockRouter.push).toHaveBeenCalledWith('/profile/testuser');
      expect(mockUpdateProfileService.updateProfile).toHaveBeenCalledWith(
        {
          displayName: 'Updated Name',
          bio: 'Updated bio',
          location: 'Updated location',
          websiteUrl: 'https://updated.com',
          birthDate: '1995-06-15',
          deleteBanner: false,
        },
        undefined,
        undefined,
      );
    });

    it('handles file uploads in submission', async () => {
      const { name, bannerFileInput, profileFileInput, handleSubmit } = useEditProfile();

      name.value = 'Updated Name';

      const mockBannerFile = new File(['banner'], 'banner.jpg', { type: 'image/jpeg' });
      const mockProfileFile = new File(['profile'], 'profile.jpg', { type: 'image/jpeg' });

      const mockBannerInput = document.createElement('input') as HTMLInputElement;
      const mockProfileInput = document.createElement('input') as HTMLInputElement;

      Object.defineProperty(mockBannerInput, 'files', {
        value: [mockBannerFile],
        writable: false,
      });
      Object.defineProperty(mockProfileInput, 'files', {
        value: [mockProfileFile],
        writable: false,
      });

      bannerFileInput.value = mockBannerInput;
      profileFileInput.value = mockProfileInput;

      await handleSubmit();

      expect(mockUpdateProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Updated Name',
        }),
        mockProfileFile,
        mockBannerFile,
      );
    });

    it('sets deleteBanner flag when banner is removed', async () => {
      const { name, selectedImage, handleSubmit } = useEditProfile();

      name.value = 'Updated Name';
      selectedImage.value = null;

      await handleSubmit();

      expect(mockUpdateProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          deleteBanner: true,
        }),
        undefined,
        undefined,
      );
    });

    it('invalidates queries after successful update', async () => {
      const { name, handleSubmit } = useEditProfile();

      name.value = 'Updated Name';

      await handleSubmit();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['layout-data'],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['profile', 'testuser'],
      });
    });

    it('handles null values in profile data', async () => {
      const { name, bio, location, website, handleSubmit } = useEditProfile();

      name.value = 'Updated Name';
      bio.value = '';
      location.value = '';
      website.value = '';

      await handleSubmit();

      expect(mockUpdateProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Updated Name',
          bio: null,
          location: null,
          websiteUrl: null,
        }),
        undefined,
        undefined,
      );
    });
  });
});
