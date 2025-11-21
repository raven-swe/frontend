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

  describe('reset', () => {
    const mockReset = vi.fn();

    beforeEach(() => {
      mockReset.mockClear();
    });

    it('calls grecaptcha.reset with element id when grecaptcha is available', () => {
      window.grecaptcha = {
        render: mockRender,
        reset: mockReset,
      };

      const { reset } = useRecaptcha();
      reset('captcha-element');

      expect(mockReset).toHaveBeenCalledWith('captcha-element');
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('does not throw error when grecaptcha is not available', () => {
      window.grecaptcha = undefined;

      const { reset } = useRecaptcha();

      expect(() => reset('captcha-element')).not.toThrow();
      expect(mockReset).not.toHaveBeenCalled();
    });

    it('calls grecaptcha.reset with undefined element id', () => {
      window.grecaptcha = {
        render: mockRender,
        reset: mockReset,
      };

      const { reset } = useRecaptcha();
      reset(undefined);

      expect(mockReset).toHaveBeenCalledWith(undefined);
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('handles multiple reset calls', () => {
      window.grecaptcha = {
        render: mockRender,
        reset: mockReset,
      };

      const { reset } = useRecaptcha();
      reset('captcha-1');
      reset('captcha-2');
      reset('captcha-3');

      expect(mockReset).toHaveBeenCalledTimes(3);
      expect(mockReset).toHaveBeenNthCalledWith(1, 'captcha-1');
      expect(mockReset).toHaveBeenNthCalledWith(2, 'captcha-2');
      expect(mockReset).toHaveBeenNthCalledWith(3, 'captcha-3');
    });
  });
});
