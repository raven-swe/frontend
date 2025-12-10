import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import IndexPage from '~/pages/search/index.vue';

const mockNavigateTo = vi.fn();
const mockRouteQuery = ref<Record<string, string>>({});

mockNuxtImport('useRoute', () => {
  return () => ({
    query: mockRouteQuery.value,
  });
});

vi.mock('#app', async () => {
  const actual = await vi.importActual('#app');
  return {
    ...actual,
    navigateTo: (...args: unknown[]) => mockNavigateTo(...args),
  };
});

describe('Search index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteQuery.value = {};
  });

  it('redirects to /search/top without query parameter', async () => {
    mockRouteQuery.value = {};

    await mountSuspended(IndexPage, {
      route: '/search',
    });

    expect(mockNavigateTo).toHaveBeenCalledWith('/search/top', { redirectCode: 301 });
  });

  it('redirects to /search/top with query parameter preserved', async () => {
    mockRouteQuery.value = { q: 'test' };

    await mountSuspended(IndexPage, {
      route: '/search?q=test',
    });

    expect(mockNavigateTo).toHaveBeenCalledWith('/search/top?q=test', { redirectCode: 301 });
  });

  it('redirects with encoded query parameter', async () => {
    mockRouteQuery.value = { q: 'test query' };

    await mountSuspended(IndexPage, {
      route: '/search?q=test%20query',
    });

    expect(mockNavigateTo).toHaveBeenCalledWith('/search/top?q=test query', { redirectCode: 301 });
  });
});
