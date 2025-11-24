import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, defineComponent } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// i18n mock
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (k: string) => k,
    locale: ref('en'),
  });
});

// Router mock (Nuxt internals expect both push & replace)
const pushSpy = vi.fn();
const replaceSpy = vi.fn();
mockNuxtImport('useRouter', () => {
  return () => ({ push: pushSpy, replace: replaceSpy });
});

// User store mock
let userStoreData: { user: { username: string } };
mockNuxtImport('useUserStore', () => {
  return () => userStoreData;
});

// useEditProfile composable mock
const handleSubmitSpy = vi.fn();
let hasUnsavedChangesRef = ref(false);
let isFormValidRef = ref(false);
interface StubFileInput {
  id: string;
}
let bannerFileInputRef = ref<StubFileInput | null>(null);
let profileFileInputRef = ref<StubFileInput | null>(null);
mockNuxtImport('useEditProfile', () => {
  return () => ({
    bannerFileInput: bannerFileInputRef,
    profileFileInput: profileFileInputRef,
    selectedImage: ref<File | null>(null),
    selectedProfileImage: ref<File | null>(null),
    name: ref('Name'),
    bio: ref('Bio'),
    location: ref('Location'),
    website: ref('https://example.com'),
    birthDate: ref('2000-01-01'),
    hasUnsavedChanges: hasUnsavedChangesRef,
    isFormValid: isFormValidRef,
    isNameValid: ref(true),
    isWebsiteValid: ref(true),
    isAgeValid: ref(true),
    handleSubmit: handleSubmitSpy,
  });
});

// Component stubs (minimal templates)
const UiDialogStub = { template: '<div><slot /></div>' };
const UiDialogContentStub = {
  template: '<div><slot name="header" /><slot /></div>',
  props: ['open', 'headerClass', 'hideCloseButton'],
};
const UiDialogTitleStub = { template: '<div><slot /></div>' };
const UiDialogFooterStub = { template: '<div />' };
const UiButtonStub = {
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  props: ['disabled', 'variant', 'size', 'class'],
};
const IconStub = { template: '<i @click="$emit(\'click\')" />', props: ['name', 'class'] };
const VisuallyHiddenStub = { template: '<span style="display:none"><slot /></span>' };
// Stubs exposing a fileInput property to trigger watcher assignments
const EditProfileBannerStub = defineComponent({
  props: ['selectedImage', 'fileInputRef'],
  setup() {
    const fileInput = { id: 'banner-file-input' };
    return { fileInput };
  },
  template: '<div />',
});
const EditProfileAvatarStub = defineComponent({
  props: ['selectedProfileImage'],
  setup() {
    const fileInput = { id: 'avatar-file-input' };
    return { fileInput };
  },
  template: '<div />',
});
const EditProfileInfoStub = {
  template: '<div />',
  props: [
    'name',
    'bio',
    'location',
    'website',
    'birthDate',
    'isNameValid',
    'isAgeValid',
    'isWebsiteValid',
  ],
};
const DiscardChangesDialogStub = {
  props: ['open'],
  emits: ['discard', 'cancel'],
  template:
    '<div data-testid="discard-dialog"><button v-if="open" data-testid="discard-btn" @click="$emit(\'discard\')">discard</button><button v-if="open" data-testid="cancel-btn" @click="$emit(\'cancel\')">cancel</button></div>',
};

/* eslint-disable import/first */
import ProfilePage from '@/pages/settings/profile.vue';
/* eslint-enable import/first */

describe('Settings Profile Page', () => {
  beforeEach(() => {
    userStoreData = { user: { username: 'currentUser' } };
    pushSpy.mockReset();
    handleSubmitSpy.mockReset();
    hasUnsavedChangesRef = ref(false);
    isFormValidRef = ref(false);
    bannerFileInputRef = ref<StubFileInput | null>(null);
    profileFileInputRef = ref<StubFileInput | null>(null);
  });

  const mountPage = () =>
    mountSuspended(ProfilePage, {
      global: {
        stubs: {
          UiDialog: UiDialogStub,
          UiDialogContent: UiDialogContentStub,
          UiDialogTitle: UiDialogTitleStub,
          UiDialogFooter: UiDialogFooterStub,
          UiButton: UiButtonStub,
          Icon: IconStub,
          VisuallyHidden: VisuallyHiddenStub,
          EditProfileBanner: EditProfileBannerStub,
          EditProfileAvatar: EditProfileAvatarStub,
          EditProfileInfo: EditProfileInfoStub,
          DiscardChangesDialog: DiscardChangesDialogStub,
        },
      },
    });

  it('renders header and save button initially disabled when form invalid', async () => {
    const wrapper = await mountPage();
    expect(wrapper.html()).toContain('Edit profile');
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save'));
    expect(saveBtn).toBeDefined();
    expect(saveBtn!.attributes('disabled')).toBeDefined();
  });

  it('enables save button when form becomes valid', async () => {
    const wrapper = await mountPage();
    isFormValidRef.value = true;
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save'));
    expect(saveBtn!.attributes('disabled')).toBeUndefined();
  });

  it('clicking save triggers handleSubmit when form valid', async () => {
    const wrapper = await mountPage();
    isFormValidRef.value = true;
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save'));
    await saveBtn!.trigger('click');
    expect(handleSubmitSpy).toHaveBeenCalled();
  });

  it('close button navigates directly when no unsaved changes', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = false;
    await wrapper.vm.$nextTick();
    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Close'));
    await closeBtn!.trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/profile/currentUser');
  });

  it('close button opens discard dialog when unsaved changes present', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = true;
    await wrapper.vm.$nextTick();
    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Close'));
    await closeBtn!.trigger('click');
    // Discard dialog open -> discard button should be in DOM
    const discardBtn = wrapper.find('[data-testid="discard-btn"]');
    expect(discardBtn.exists()).toBe(true);
  });

  it('discard dialog discard action navigates to profile', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = true;
    await wrapper.vm.$nextTick();
    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Close'));
    await closeBtn!.trigger('click');
    const discardBtn = wrapper.get('[data-testid="discard-btn"]');
    await discardBtn.trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/profile/currentUser');
  });

  it('discard dialog cancel action hides dialog', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = true;
    await wrapper.vm.$nextTick();
    const closeBtn = wrapper.findAll('button').find((b) => b.text().includes('Close'));
    await closeBtn!.trigger('click');
    const cancelBtn = wrapper.get('[data-testid="cancel-btn"]');
    await cancelBtn.trigger('click');
    // After cancel, discard dialog buttons should disappear
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="discard-btn"]').exists()).toBe(false);
  });

  it('assigns banner and avatar file inputs via watchers', async () => {
    const wrapper = await mountPage();
    await wrapper.vm.$nextTick();
    // They should have been assigned the stub fileInput objects
    expect(bannerFileInputRef.value).toEqual({ id: 'banner-file-input' });
    expect(profileFileInputRef.value).toEqual({ id: 'avatar-file-input' });
  });

  it('initially keeps discard dialog closed', async () => {
    const wrapper = await mountPage();
    await wrapper.vm.$nextTick();
    // Discard dialog should not render discard button when closed
    expect(wrapper.find('[data-testid="discard-btn"]').exists()).toBe(false);
  });

  it('does not assign file inputs when child components lack fileInput property', async () => {
    // Mount with alternate stubs that omit fileInput to exercise watcher branch when condition fails
    const AltBannerStub = defineComponent({
      props: ['selectedImage', 'fileInputRef'],
      setup() {
        return {};
      },
      template: '<div />',
    });
    const AltAvatarStub = defineComponent({
      props: ['selectedProfileImage'],
      setup() {
        return {};
      },
      template: '<div />',
    });
    // Reset refs explicitly
    bannerFileInputRef.value = null;
    profileFileInputRef.value = null;
    const wrapper = await mountSuspended(ProfilePage, {
      global: {
        stubs: {
          UiDialog: UiDialogStub,
          UiDialogContent: UiDialogContentStub,
          UiDialogTitle: UiDialogTitleStub,
          UiDialogFooter: UiDialogFooterStub,
          UiButton: UiButtonStub,
          Icon: IconStub,
          VisuallyHidden: VisuallyHiddenStub,
          EditProfileBanner: AltBannerStub,
          EditProfileAvatar: AltAvatarStub,
          EditProfileInfo: EditProfileInfoStub,
          DiscardChangesDialog: DiscardChangesDialogStub,
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(bannerFileInputRef.value).toBeNull();
    expect(profileFileInputRef.value).toBeNull();
  });

  it('handleDialogClose early navigates and does not open discard dialog when no unsaved changes', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = false;
    await wrapper.vm.$nextTick();
    // Directly invoke method via type assertion to component instance
    const { handleDialogClose } = wrapper.vm as unknown as { handleDialogClose: () => void };
    handleDialogClose();
    expect(pushSpy).toHaveBeenCalledWith('/profile/currentUser');
    expect(wrapper.find('[data-testid="discard-btn"]').exists()).toBe(false);
  });

  it('handleDialogClose opens discard dialog when unsaved changes present', async () => {
    const wrapper = await mountPage();
    hasUnsavedChangesRef.value = true;
    await wrapper.vm.$nextTick();
    const { handleDialogClose } = wrapper.vm as unknown as { handleDialogClose: () => void };
    handleDialogClose();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="discard-btn"]').exists()).toBe(true);
  });

  it('handleDiscard navigates to profile and can be invoked directly', async () => {
    const wrapper = await mountPage();
    const { handleDiscard } = wrapper.vm as unknown as { handleDiscard: () => void };
    handleDiscard();
    expect(pushSpy).toHaveBeenCalledWith('/profile/currentUser');
  });

  it('__testGetProfileState returns current reactive state snapshot', async () => {
    const wrapper = await mountPage();
    // initial state
    const { __testGetProfileState } = wrapper.vm as unknown as {
      __testGetProfileState: () => { hasUnsaved: boolean; isValid: boolean; dialogOpen: boolean };
    };
    let snap = __testGetProfileState();
    expect(snap).toEqual({ hasUnsaved: false, isValid: false, dialogOpen: false });
    // mutate state
    hasUnsavedChangesRef.value = true;
    isFormValidRef.value = true;
    await wrapper.vm.$nextTick();
    // open dialog
    const { handleDialogClose } = wrapper.vm as unknown as { handleDialogClose: () => void };
    handleDialogClose();
    await wrapper.vm.$nextTick();
    snap = __testGetProfileState();
    expect(snap).toEqual({ hasUnsaved: true, isValid: true, dialogOpen: true });
  });
});
