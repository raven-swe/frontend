import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';

// Mock useRoute to provide a test code
mockNuxtImport('useRoute', () => {
  return () => ({
    query: { code: 'test-google-code' },
  });
});

// Mock useRouter to spy on push
const pushMock = vi.fn();
mockNuxtImport('useRouter', () => {
  return () => ({
    push: pushMock,
  });
});

// Mock OAuthCompleteForm
vi.mock('~/components/ui/OAuthCompleteForm.vue', () => ({
  default: {
    name: 'OAuthCompleteForm',
    template: '<div>OAuth Form</div>',
    props: ['creationToken'],
  },
}));

// Mock $fetch
const fetchMock = vi.fn();
fetchMock.create = vi.fn(() => fetchMock);
vi.stubGlobal('$fetch', fetchMock);

describe('Google Callback Page', () => {
  let PageComponent: Component;
  beforeEach(async () => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    pushMock.mockReset();
    PageComponent = (await import('../../../../../../app/pages/auth/callback/google/index.vue'))
      .default;
  });

  it('should call $fetch and show form if creationToken is returned', async () => {
    const originalOpener = window.opener;
    window.opener = undefined;
    fetchMock.mockResolvedValue({ success: true, data: { creationToken: 'abc123' } });

    mount(PageComponent);
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/oauth/google/callback',
      expect.objectContaining({
        method: 'POST',
        body: { providerToken: 'test-google-code' },
      }),
    );
    expect(pushMock).not.toHaveBeenCalled();
    window.opener = originalOpener;
  });

  it('should call router.push if accessToken is returned', async () => {
    const originalOpener = window.opener;
    window.opener = undefined;
    fetchMock.mockResolvedValue({ success: true, data: { accessToken: 'token' } });

    mount(PageComponent);
    await new Promise((r) => setTimeout(r, 0));
    expect(pushMock).toHaveBeenCalledWith('/home');
    window.opener = originalOpener;
  });

  it('should handle fetch error gracefully', async () => {
    const originalOpener = window.opener;
    window.opener = undefined;
    fetchMock.mockRejectedValue(new Error('fail'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mount(PageComponent);
    await new Promise((r) => setTimeout(r, 0));
    expect(errorSpy).toHaveBeenCalledWith('Google authentication failed:', expect.any(Error));
    errorSpy.mockRestore();
    window.opener = originalOpener;
  });
});
