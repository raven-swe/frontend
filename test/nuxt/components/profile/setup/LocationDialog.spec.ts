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

describe('LocationDialog.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders correctly when open', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog, Dialog },
        template: `
          <Dialog open>
            <LocationDialog open />
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
    expect(content?.querySelector('input[type="text"]')).toBeTruthy();
    expect(content?.querySelector('.text-3xl')?.textContent).toBe(
      i18n.global.t('profile.setup.add-location'),
    );
    wrapper.unmount();
  });

  it('emits submit event with location text when submitted', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog },
        template: '<LocationDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    // Set location value directly on the component
    const locationDialog = wrapper.findComponent(LocationDialog);
    await locationDialog.vm.$nextTick();

    // Find and set the input value
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.value = 'New York, USA';
      input.dispatchEvent(new Event('input'));
    }
    await flushPromises();

    // Find and click the submit button
    const button = document.querySelector('.w-100') as HTMLButtonElement;
    await button?.click();
    await flushPromises();

    expect(locationDialog.emitted()).toHaveProperty('submit');
    expect(locationDialog.emitted('submit')?.[0]).toEqual(['New York, USA']);
  });

  it('shows "Skip for now" button when location is empty', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog },
        template: '<LocationDialog :open="true" />',
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

  it('shows "Next" button when location is not empty', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog },
        template: '<LocationDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    // Set location value
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.value = 'San Francisco';
      input.dispatchEvent(new Event('input'));
    }
    await flushPromises();

    const button = document.querySelector('.w-100') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe(i18n.global.t('ui.next'));
    expect(button?.className).toContain('primary');
    wrapper.unmount();
  });

  it('emits update:open event when dialog is closed', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog },
        template: '<LocationDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    // Get the LocationDialog component instance
    const locationDialog = wrapper.findComponent(LocationDialog);

    // Find the underlying UiDialog and emit its update:open event
    const uiDialog = locationDialog.findComponent({ name: 'UiDialog' });
    uiDialog.vm.$emit('update:open', false);

    await locationDialog.vm.$nextTick();

    // Verify that LocationDialog emitted update:open with false
    expect(locationDialog.emitted()).toHaveProperty('update:open');
    expect(locationDialog.emitted('update:open')?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it('enforces maximum character limit of 30', async () => {
    const { default: LocationDialog } = await import(
      '@/components/profile/setup/LocationDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { LocationDialog, Dialog },
        template: `
          <Dialog open>
            <LocationDialog open />
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
    const input = content?.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.getAttribute('maxlength')).toBe('30');
    wrapper.unmount();
  });
});
