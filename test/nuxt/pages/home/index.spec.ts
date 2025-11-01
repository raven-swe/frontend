import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';

const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
  };
});

mockNuxtImport('navigateTo', () => navigateToMock);

describe('Home Index Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /home/for-you with code 301', async () => {
    const { default: HomePage } = await import('~/pages/home/index.vue');
    await mountSuspended(HomePage);

    expect(navigateToMock).toHaveBeenCalledWith('/home/for-you', { redirectCode: 301 });
  });

  it('calls navigateTo exactly once', async () => {
    const { default: HomePage } = await import('~/pages/home/index.vue');
    await mountSuspended(HomePage);

    expect(navigateToMock).toHaveBeenCalledTimes(1);
  });
});
