import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import Dialog from '@/components/ui/dialog/Dialog.vue';

// Helper to wait for all promises to resolve
async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('ProfilePictureDialog.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders correctly when open', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog, Dialog },
        template: `
          <Dialog open>
            <ProfilePictureDialog open />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.querySelector('img')).toBeTruthy();
    expect(content?.querySelector('.text-3xl')?.textContent).toBe(
      i18n.global.t('profile.setup.pick-profile-picture'),
    );
    wrapper.unmount();
  });

  it('shows "Skip for now" button when no image is selected', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.skip-for-now'));
    expect(button?.className).toContain('outline');
    wrapper.unmount();
  });

  it('shows "Next" button when image is selected', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    // Simulate file selection
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    input.dispatchEvent(new Event('change'));
    await flushPromises();

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.next'));
    expect(button?.className).toContain('primary');
    wrapper.unmount();
  });

  it('emits submit event with file and dataUrl when submitted', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const profileDialog = wrapper.findComponent(ProfilePictureDialog);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    input.dispatchEvent(new Event('change'));

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    await button?.click();

    expect(profileDialog.emitted()).toHaveProperty('submit');
    const emittedData = profileDialog.emitted('submit')?.[0]?.[0] as {
      file: File | null;
      dataUrl: string | null;
    };
    expect(emittedData).toHaveProperty('file');
    expect(emittedData).toHaveProperty('dataUrl');
  });

  it('emits update:open event when dialog is closed', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const profileDialog = wrapper.findComponent(ProfilePictureDialog);
    const uiDialog = profileDialog.findComponent({ name: 'UiDialog' });
    uiDialog.vm.$emit('update:open', false);

    await profileDialog.vm.$nextTick();

    expect(profileDialog.emitted()).toHaveProperty('update:open');
    expect(profileDialog.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('opens file input when camera button is clicked', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const profileDialog = wrapper.findComponent(ProfilePictureDialog);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    // Call the handleImageClick method directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (profileDialog.vm as any).handleImageClick();

    expect(clickSpy).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('displays default profile image when no image is selected', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const img = document.querySelector('.object-cover') as HTMLImageElement;
    expect(img).toBeTruthy();

    expect(img.src).toContain('default_profile.png');
    wrapper.unmount();
  });

  it('does not update selectedImage when no file is selected', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate change event with no files
    Object.defineProperty(input, 'files', {
      value: [],
      writable: false,
    });

    input.dispatchEvent(new Event('change'));
    await flushPromises();

    const img = document.querySelector('.object-cover') as HTMLImageElement;
    expect(img.src).toContain('default_profile.png');

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.skip-for-now'));
    wrapper.unmount();
  });

  it('does not update selectedImage when file input is null', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate change event with null files
    Object.defineProperty(input, 'files', {
      value: null,
      writable: false,
    });

    input.dispatchEvent(new Event('change'));
    await flushPromises();

    const img = document.querySelector('.object-cover') as HTMLImageElement;
    expect(img.src).toContain('default_profile.png');
    wrapper.unmount();
  });

  it('emits submit with null values when skip button is clicked', async () => {
    const { default: ProfilePictureDialog } = await import(
      '@/components/profile/setup/ProfilePictureDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { ProfilePictureDialog },
        template: '<ProfilePictureDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const profileDialog = wrapper.findComponent(ProfilePictureDialog);
    const button = document.querySelector('.w-100') as HTMLButtonElement;

    await button?.click();

    expect(profileDialog.emitted()).toHaveProperty('submit');
    const emittedData = profileDialog.emitted('submit')?.[0]?.[0] as {
      file: File | null;
      dataUrl: string | null;
    };
    expect(emittedData.file).toBeNull();
    expect(emittedData.dataUrl).toBeNull();
    wrapper.unmount();
  });
});
