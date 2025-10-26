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

// Mock useProfileSetupFlow composable
vi.mock('@/composables/useProfileSetupFlow', () => ({
  useProfileSetupFlow: () => ({
    formData: {
      avatarUrl: null,
    },
  }),
}));

describe('HeaderDialog.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders correctly when open', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog, Dialog },
        template: `
          <Dialog open>
            <HeaderDialog open />
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
      i18n.global.t('profile.setup.pick-header'),
    );
    wrapper.unmount();
  });

  it('shows "Skip for now" button when no image is selected', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
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
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
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

  it('emits submit event with file when submitted', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const headerDialog = wrapper.findComponent(HeaderDialog);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    input.dispatchEvent(new Event('change'));

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    await button?.click();

    expect(headerDialog.emitted()).toHaveProperty('submit');
    const emittedData = headerDialog.emitted('submit')?.[0]?.[0] as File | null;
    expect(emittedData).toBeInstanceOf(File);
  });

  it('emits update:open event when dialog is closed', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const headerDialog = wrapper.findComponent(HeaderDialog);
    const uiDialog = headerDialog.findComponent({ name: 'UiDialog' });
    uiDialog.vm.$emit('update:open', false);

    await headerDialog.vm.$nextTick();

    expect(headerDialog.emitted()).toHaveProperty('update:open');
    expect(headerDialog.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('opens file input when camera button is clicked', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const headerDialog = wrapper.findComponent(HeaderDialog);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    // Call the handleImageClick method directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (headerDialog.vm as any).handleImageClick();

    expect(clickSpy).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('displays default placeholder when no image is selected', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const placeholder = document.querySelector('.bg-muted-foreground\\/50');
    expect(placeholder).toBeTruthy();
    wrapper.unmount();
  });

  it('displays selected header image when file is selected', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    input.dispatchEvent(new Event('change'));
    await flushPromises();

    const headerImage = document.querySelector('.object-cover.rounded-lg') as HTMLImageElement;
    expect(headerImage).toBeTruthy();
    expect(headerImage.src).not.toContain('default_profile.png');
    wrapper.unmount();
  });

  it('does not update selectedImage when no file is selected', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
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

    const placeholder = document.querySelector('.bg-muted-foreground\\/50');
    expect(placeholder).toBeTruthy();

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.skip-for-now'));
    wrapper.unmount();
  });

  it('does not update selectedImage when file input is null', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
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

    const placeholder = document.querySelector('.bg-muted-foreground\\/50');
    expect(placeholder).toBeTruthy();
    wrapper.unmount();
  });

  it('emits submit with null when skip button is clicked', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const headerDialog = wrapper.findComponent(HeaderDialog);
    const button = document.querySelector('.w-100') as HTMLButtonElement;

    await button?.click();

    expect(headerDialog.emitted()).toHaveProperty('submit');
    const emittedData = headerDialog.emitted('submit')?.[0]?.[0] as File | null;
    expect(emittedData).toBeNull();
    wrapper.unmount();
  });

  it('displays profile information with default avatar', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const profileImage = document.querySelector('.profile-picture') as HTMLImageElement;
    expect(profileImage).toBeTruthy();
    expect(profileImage.src).toContain('default_profile.png');
    wrapper.unmount();
  });

  it('opens file input when placeholder area is clicked', async () => {
    const { default: HeaderDialog } = await import('@/components/profile/setup/HeaderDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { HeaderDialog },
        template: '<HeaderDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    const placeholder = document.querySelector('.bg-muted-foreground\\/50') as HTMLDivElement;
    await placeholder?.click();

    expect(clickSpy).toHaveBeenCalled();
    wrapper.unmount();
  });
});
