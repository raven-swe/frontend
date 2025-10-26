import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import Dialog from '@/components/ui/dialog/Dialog.vue';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('DiscardChangesDialog.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders correctly when open', async () => {
    const { default: DiscardChangesDialog } = await import(
      '@/components/profile/edit/DiscardChangesDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { DiscardChangesDialog, Dialog },
        template: `
          <Dialog open>
            <DiscardChangesDialog :open="true" />
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
    expect(content?.querySelector('.text-xl')?.textContent).toBe(
      i18n.global.t('profile.edit.discard-changes'),
    );
    expect(content?.querySelector('.text-sm')?.textContent).toBe(
      i18n.global.t('profile.edit.discard-changes-desc'),
    );
    wrapper.unmount();
  });

  it('displays discard and cancel buttons', async () => {
    const { default: DiscardChangesDialog } = await import(
      '@/components/profile/edit/DiscardChangesDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { DiscardChangesDialog },
        template: '<DiscardChangesDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const buttons = document.querySelectorAll('button');
    const buttonTexts = Array.from(buttons).map((btn) => btn.textContent?.trim());

    expect(buttonTexts).toContain(i18n.global.t('ui.discard'));
    expect(buttonTexts).toContain(i18n.global.t('ui.cancel'));
    wrapper.unmount();
  });

  it('emits discard event when discard button is clicked', async () => {
    const { default: DiscardChangesDialog } = await import(
      '@/components/profile/edit/DiscardChangesDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { DiscardChangesDialog },
        template: '<DiscardChangesDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const discardDialog = wrapper.findComponent(DiscardChangesDialog);
    const buttons = document.querySelectorAll('button');
    const discardButton = Array.from(buttons).find(
      (btn) => btn.textContent?.trim() === i18n.global.t('ui.discard'),
    ) as HTMLButtonElement;

    await discardButton?.click();

    expect(discardDialog.emitted()).toHaveProperty('discard');
    expect(discardDialog.emitted()).toHaveProperty('update:open');
    expect(discardDialog.emitted('update:open')?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const { default: DiscardChangesDialog } = await import(
      '@/components/profile/edit/DiscardChangesDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { DiscardChangesDialog },
        template: '<DiscardChangesDialog :open="true" />',
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const discardDialog = wrapper.findComponent(DiscardChangesDialog);
    const buttons = document.querySelectorAll('button');
    const cancelButton = Array.from(buttons).find(
      (btn) => btn.textContent?.trim() === i18n.global.t('ui.cancel'),
    ) as HTMLButtonElement;

    await cancelButton?.click();

    expect(discardDialog.emitted()).toHaveProperty('cancel');
    expect(discardDialog.emitted()).toHaveProperty('update:open');
    expect(discardDialog.emitted('update:open')?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it('does not display close button', async () => {
    const { default: DiscardChangesDialog } = await import(
      '@/components/profile/edit/DiscardChangesDialog.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { DiscardChangesDialog, Dialog },
        template: `
          <Dialog open>
            <DiscardChangesDialog :open="true" />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const closeButton = document.querySelector('[aria-label="Close"]');
    expect(closeButton).toBeFalsy();
    wrapper.unmount();
  });
});
