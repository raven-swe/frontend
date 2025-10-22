// @vitest-environment nuxt
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { reactive } from 'vue';

const i18n = createI18n({
  locale: 'en',
  messages: { en: await import('@@/i18n/locales/en.json') },
});

describe('LoginDialog Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.unmock('~/stores/auth/login');
    vi.resetModules();
    vi.resetAllMocks();
    document.body.innerHTML = '';
  });

  it('renders content when store.open = true and step = 0', async () => {
    const store = reactive({
      open: true,
      step: 0,
      loading: false,
      closeDialog: vi.fn(),
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    await new Promise((r) => setTimeout(r, 0));

    const dialog = document.querySelector('[data-slot="dialog-content"]');
    expect(dialog).toBeTruthy();
    expect(store.open).toBe(true);

    const identifierStep = document.querySelector('#identifier-step-test');
    expect(identifierStep).toBeTruthy();

    const passwordStep = document.querySelector('#password-step-test');
    expect(passwordStep).toBeFalsy();
  });

  it('does not render content when store.open = false', async () => {
    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => ({
        open: false,
        step: 0,
        loading: false,
        closeDialog: vi.fn(),
      }),
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    await new Promise((r) => setTimeout(r, 0));

    const dialog = document.querySelector('[data-slot="dialog-content"]');
    expect(dialog).toBeFalsy();
  });

  it('renders spinner when loading = true', async () => {
    const store = reactive({
      open: true,
      step: 0,
      loading: true,
      closeDialog: vi.fn(),
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    await new Promise((r) => setTimeout(r, 0));

    const spinner = document.querySelector('.mx-auto.my-auto');
    expect(spinner).toBeTruthy();
  });

  it('calls closeDialog() when dialog is closed', async () => {
    const closeDialogMock = vi.fn();
    const store = reactive({
      open: true,
      step: 0,
      loading: false,
      closeDialog: closeDialogMock,
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    const wrapper = await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    // simulate @update:open=false event
    const uiDialog = wrapper.findComponent({ name: 'UiDialog' });
    await uiDialog.vm.$emit('update:open', false);

    expect(closeDialogMock).toHaveBeenCalled();
    expect(store.open).toBe(false);
  });

  ////////////////////////////////

  it('sets store.open = true when handleDialogChange(true) is called', async () => {
    const store = reactive({
      open: false,
      step: 0,
      loading: false,
      closeDialog: vi.fn(),
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    const wrapper = await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    const uiDialog = wrapper.findComponent({ name: 'UiDialog' });
    await uiDialog.vm.$emit('update:open', true);

    expect(store.open).toBe(true);
    expect(store.closeDialog).not.toHaveBeenCalled();
  });

  it('renders AuthLoginPasswordStep when step = 1', async () => {
    const store = reactive({
      open: true,
      step: 1,
      loading: false,
      closeDialog: vi.fn(),
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    await new Promise((r) => setTimeout(r, 0));

    const passwordStep = document.querySelector('#password-step-test');
    expect(passwordStep).toBeTruthy();
  });

  it('renders only spinner when loading = true', async () => {
    const store = reactive({
      open: true,
      step: 1,
      loading: true,
      closeDialog: vi.fn(),
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    await new Promise((r) => setTimeout(r, 0));

    const spinner = document.querySelector('.mx-auto.my-auto');
    const identifier = document.querySelector('authloginidentifierstep-stub');
    const password = document.querySelector('authloginpasswordstep-stub');
    expect(spinner).toBeTruthy();
    expect(identifier).toBeFalsy();
    expect(password).toBeFalsy();
  });

  it('calls closeDialog() even if loading = true when dialog closes', async () => {
    const closeDialogMock = vi.fn();
    const store = reactive({
      open: true,
      step: 0,
      loading: true,
      closeDialog: closeDialogMock,
    });

    vi.doMock('~/stores/auth/login', () => ({
      useLoginStore: () => store,
    }));

    const { default: LoginDialog } = await import('@/components/auth/login/LoginDialog.vue');
    const wrapper = await mountSuspended(LoginDialog, {
      global: { plugins: [i18n] },
    });

    const uiDialog = wrapper.findComponent({ name: 'UiDialog' });
    await uiDialog.vm.$emit('update:open', false);

    expect(closeDialogMock).toHaveBeenCalled();
    expect(store.open).toBe(false);
  });
});
