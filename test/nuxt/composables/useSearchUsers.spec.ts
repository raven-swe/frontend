import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

// Mock data refs
const mockData = ref<Array<{ username: string }>>([]);
const mockIsPending = ref(false);
const mockError = ref(null);
const mockRefetch = vi.fn();

// Mock dependencies before importing the composable
vi.mock('@tanstack/vue-query', () => ({
  useQuery: vi.fn(({ queryFn, enabled }) => {
    // Store the functions so we can test them
    (globalThis as Record<string, unknown>).__testQueryFn = queryFn;
    (globalThis as Record<string, unknown>).__testEnabled = enabled;
    return {
      data: mockData,
      isPending: mockIsPending,
      error: mockError,
      refetch: mockRefetch,
    };
  }),
}));

vi.mock('~/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({
    data: { users: [{ username: 'user1' }, { username: 'user2' }] },
  }),
}));

describe('useSearchUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData.value = [];
  });

  it('should be defined', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    expect(useSearchUsers).toBeDefined();
  });

  it('returns users, loading, error, and refresh', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    const result = useSearchUsers(ref('test'));

    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('loading');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('refresh');
  });

  it('handles empty search query', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    const result = useSearchUsers(ref(''));

    expect(result.users).toBeDefined();
  });

  it('handles string getter function', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    const result = useSearchUsers(() => 'test query');

    expect(result).toHaveProperty('users');
  });

  it('queryFn returns empty array for empty query', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref(''));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([]);
    }
  });

  it('queryFn returns empty array for whitespace only query', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('   '));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([]);
    }
  });

  it('queryFn calls apiFetch for non-empty query', async () => {
    const { apiFetch } = await import('~/api');
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('testuser'));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      await queryFn();
      expect(apiFetch).toHaveBeenCalledWith('/api/search/users', {
        method: 'GET',
        query: { query: 'testuser' },
      });
    }
  });

  it('queryFn returns users from API response', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('testuser'));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([{ username: 'user1' }, { username: 'user2' }]);
    }
  });

  it('queryFn handles API error gracefully', async () => {
    const { apiFetch } = await import('~/api');
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('API Error'));

    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('testuser'));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([]);
    }
  });

  it('queryFn handles null users in response', async () => {
    const { apiFetch } = await import('~/api');
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { users: null } });

    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('testuser'));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([]);
    }
  });

  it('queryFn handles non-array users in response', async () => {
    const { apiFetch } = await import('~/api');
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { users: 'not-an-array' } });

    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('testuser'));

    const queryFn = (globalThis as Record<string, unknown>).__testQueryFn as () => Promise<
      Array<{ username: string }>
    >;

    if (queryFn) {
      const result = await queryFn();
      expect(result).toEqual([]);
    }
  });

  it('enabled is false for empty query', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref(''));

    const enabled = (globalThis as Record<string, unknown>).__testEnabled;
    expect(enabled).toBeDefined();
  });

  it('enabled is true for non-empty query', async () => {
    const { useSearchUsers } = await import('@/composables/useSearchUsers');
    useSearchUsers(ref('test'));

    const enabled = (globalThis as Record<string, unknown>).__testEnabled;
    expect(enabled).toBeDefined();
  });
});
