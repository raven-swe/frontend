import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createPinia, setActivePinia } from 'pinia';
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

describe('BioDialog.vue', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders correctly when open', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog, Dialog },
        template: `
          <Dialog open>
            <BioDialog open />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.querySelector('textarea')).toBeTruthy();
    // we probably should agree on data-testids
    expect(content?.querySelector('.text-3xl')?.textContent).toBe(
      i18n.global.t('profile.setup.enter-bio'),
    );
    wrapper.unmount();
  });

  it('emits submit event with bio text when submitted', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog },
        template: '<BioDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();

    // Set bio value directly on the component
    const bioDialog = wrapper.findComponent(BioDialog);
    await bioDialog.vm.$nextTick();

    // Find and set the textarea value
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'This is my test bio';
      textarea.dispatchEvent(new Event('input'));
    }
    await flushPromises();

    // Find and click the submit button
    const button = document.querySelector('.w-100') as HTMLButtonElement;
    await button?.click();
    await flushPromises();

    expect(bioDialog.emitted()).toHaveProperty('submit');
    expect(bioDialog.emitted('submit')?.[0]).toEqual(['This is my test bio']);
  });

  it('shows "Skip for now" button when bio is empty', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog },
        template: '<BioDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();
    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.skip-for-now'));
    expect(button?.className).toContain('outline');
    wrapper.unmount();
  });

  it('shows "Next" button when bio is not empty', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog },
        template: '<BioDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();

    // Set bio value
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Test bio';
      textarea.dispatchEvent(new Event('input'));
    }
    await flushPromises();

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.next'));
    expect(button?.className).toContain('primary');
    wrapper.unmount();
  });

  it('emits update:open event when dialog is closed', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog },
        template: '<BioDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();

    // Get the BioDialog component instance
    const bioDialog = wrapper.findComponent(BioDialog);

    // Find the underlying UiDialog and emit its update:open event
    const uiDialog = bioDialog.findComponent({ name: 'UiDialog' });
    uiDialog.vm.$emit('update:open', false);

    await bioDialog.vm.$nextTick();

    // Verify that BioDialog emitted update:open with false
    expect(bioDialog.emitted()).toHaveProperty('update:open');
    expect(bioDialog.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('enforces maximum character limit of 160', async () => {
    const { default: BioDialog } = await import('@/components/profile/setup/BioDialog.vue');
    const wrapper = await mountSuspended(
      {
        components: { BioDialog, Dialog },
        template: `
          <Dialog open>
            <BioDialog open />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();
    const content = document.querySelector('[data-slot="dialog-content"]');
    const textarea = content?.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.getAttribute('maxlength')).toBe('160');
    wrapper.unmount();
  });
});
