import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import IndexPage from '~/pages/explore/index.vue';

const mockNavigateTo = vi.fn();

vi.mock('#app', async () => {
  const actual = await vi.importActual('#app');
  return {
    ...actual,
    navigateTo: (...args: unknown[]) => mockNavigateTo(...args),
  };
});

describe('Explore index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /explore/for-you', async () => {
    await mountSuspended(IndexPage, {
      route: '/explore',
    });

    expect(mockNavigateTo).toHaveBeenCalledWith('/explore/for-you', { redirectCode: 301 });
  });
});
