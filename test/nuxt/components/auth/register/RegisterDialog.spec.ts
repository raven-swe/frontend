import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import messages from '@@/i18n/locales/en.json';

import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { reactive } from 'vue';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('RegisterDialog Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.unmock('@/stores/register');
    vi.resetModules();
    vi.resetAllMocks();
    document.body.innerHTML = '';
  });

  it('renders dialog content when store.open is true (step 0)', async () => {
    // store mocked with open: true and step: 0 above
    const store = reactive({
      open: true,
      step: 0,
      previousStep: vi.fn(),
    });
    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));
    const { default: RegisterDialogOpened } = await import(
      '@/components/auth/register/RegisterDialog.vue'
    );
    await mountSuspended(RegisterDialogOpened, {
      global: {
        plugins: [i18n],
      },
    });

    // allow teleported content to appear
    await new Promise((r) => setTimeout(r, 0));

    // Dialog content teleports to document; check it exists
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toBeTruthy();

    const closeButton = content?.querySelector('[data-slot="dialog-close"]') as HTMLElement | null;
    expect(closeButton).toBeTruthy();
    // clicking the close button should close the dialog (teleported content removed)
    closeButton!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(store.open).toBe(false);
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeFalsy();
  });

  it('does not render dialog content when store.open is false', async () => {
    // Re-mock the store with open false
    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => ({ open: false, step: 0, previousStep: vi.fn() }),
    }));
    const { default: RegisterDialogClosed } = await import(
      '@/components/auth/register/RegisterDialog.vue'
    );
    await mountSuspended(RegisterDialogClosed, {
      global: {
        plugins: [i18n],
      },
    });

    await new Promise((r) => setTimeout(r, 0));

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toBeFalsy();
  });

  it('renders back button when step !== 0 and clicking it calls previousStep', async () => {
    const prevMock = vi.fn();
    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => ({ open: true, step: 1, previousStep: prevMock }),
    }));

    const { default: RegisterDialogStep1 } = await import(
      '@/components/auth/register/RegisterDialog.vue'
    );
    await mountSuspended(RegisterDialogStep1, {
      global: {
        plugins: [i18n],
      },
    });

    // allow teleported content to appear
    await new Promise((r) => setTimeout(r, 0));

    const header = document.querySelector('[data-slot="dialog-header"]');
    expect(header).toBeTruthy();
    const button = document.querySelector('[data-test-id="back-button"]') as HTMLElement | null;
    expect(button).toBeTruthy();

    // click the back button; it is inside teleported content
    button!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(prevMock).toHaveBeenCalled();
  });
});
