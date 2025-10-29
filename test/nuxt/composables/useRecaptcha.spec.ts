import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { siteKey: 'test-site-key' },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
  }),
}));

const { default: useRecaptcha } = await import('@/composables/useRecaptcha');

const mockRender = vi.fn();
const mockAddEventListener = vi.fn();

describe('useRecaptcha', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    window.grecaptcha = undefined;
    window.addEventListener = mockAddEventListener;
  });

  it('renders immediately if grecaptcha exists', () => {
    window.grecaptcha = { render: mockRender };

    const { render } = useRecaptcha();

    const callback = vi.fn();
    const expiredCallback = vi.fn();

    render({
      elementId: 'captcha',
      callback,
      expiredCallback,
    });

    expect(mockRender).toHaveBeenCalledWith(
      'captcha',
      expect.objectContaining({
        sitekey: 'test-site-key',
        theme: 'light',
        hl: 'en',
        callback,
        'expired-callback': expiredCallback,
      }),
    );
  });

  it('waits for recaptcha-script-loaded event if grecaptcha not ready', () => {
    const { render } = useRecaptcha();

    render({
      elementId: 'captcha',
      callback: vi.fn(),
      expiredCallback: vi.fn(),
    });

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'recaptcha-script-loaded',
      expect.any(Function),
      { once: true },
    );

    // simulate event firing after grecaptcha loads
    window.grecaptcha = { render: mockRender };
    const handler = mockAddEventListener.mock.calls.find(
      ([event]) => event === 'recaptcha-script-loaded',
    )?.[1];
    handler();

    expect(mockRender).toHaveBeenCalled();
  });

  it('uses dark theme when html has dark class', () => {
    document.documentElement.classList.add('dark');
    window.grecaptcha = { render: mockRender };

    const { render } = useRecaptcha();
    render({
      elementId: 'captcha',
      callback: vi.fn(),
    });

    expect(mockRender).toHaveBeenCalledWith(
      'captcha',
      expect.objectContaining({
        theme: 'dark',
      }),
    );
  });

  it('defaults to english locale if locale missing', () => {
    mockNuxtImport('useI18n', () => ({
      locale: { value: undefined },
    }));

    window.grecaptcha = { render: mockRender };

    const { render } = useRecaptcha();
    render({
      elementId: 'captcha',
      callback: vi.fn(),
    });

    expect(mockRender).toHaveBeenCalledWith(
      'captcha',
      expect.objectContaining({
        hl: 'en',
      }),
    );
  });
});
