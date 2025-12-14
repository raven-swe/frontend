import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

// Mock data refs
const mockIsPending = ref(false);
const mockError = ref<Error | null>(null);
const mockData = ref<unknown>(null);
const mockMutateAsync = vi.fn();
const mockReset = vi.fn();
const mockSetQueryData = vi.fn();

// Mock dependencies
vi.mock('@tanstack/vue-query', () => ({
  useMutation: vi.fn(({ mutationFn, onSuccess }) => {
    // Store the functions so we can test them
    (globalThis as Record<string, unknown>).__testMutationFn = mutationFn;
    (globalThis as Record<string, unknown>).__testOnSuccess = onSuccess;
    return {
      mutateAsync: mockMutateAsync,
      isPending: mockIsPending,
      error: mockError,
      data: mockData,
      reset: mockReset,
    };
  }),
  useQueryClient: vi.fn(() => ({
    setQueryData: mockSetQueryData,
  })),
}));

vi.mock('@/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({
    data: { id: 'new-conv', participant: { username: 'testuser' } },
  }),
}));

describe('useStartConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending.value = false;
    mockError.value = null;
    mockData.value = null;
  });

  it('should be defined', async () => {
    const { useStartConversation } = await import('@/composables/useStartConversation');
    expect(useStartConversation).toBeDefined();
  });

  it('returns startConversation, isStarting, error, data, and reset', async () => {
    const { useStartConversation } = await import('@/composables/useStartConversation');
    const result = useStartConversation();

    expect(result).toHaveProperty('startConversation');
    expect(result).toHaveProperty('isStarting');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('reset');
  });

  it('mutationFn throws error for empty username', async () => {
    await import('@/composables/useStartConversation');

    const mutationFn = (globalThis as Record<string, unknown>).__testMutationFn as (
      username: string,
    ) => Promise<unknown>;

    if (mutationFn) {
      await expect(mutationFn('')).rejects.toThrow('USERNAME_REQUIRED');
    }
  });

  it('mutationFn throws error for whitespace username', async () => {
    await import('@/composables/useStartConversation');

    const mutationFn = (globalThis as Record<string, unknown>).__testMutationFn as (
      username: string,
    ) => Promise<unknown>;

    if (mutationFn) {
      await expect(mutationFn('   ')).rejects.toThrow('USERNAME_REQUIRED');
    }
  });

  it('mutationFn throws error for null username', async () => {
    await import('@/composables/useStartConversation');

    const mutationFn = (globalThis as Record<string, unknown>).__testMutationFn as (
      username: string,
    ) => Promise<unknown>;

    if (mutationFn) {
      await expect(mutationFn(null as unknown as string)).rejects.toThrow('USERNAME_REQUIRED');
    }
  });

  it('mutationFn calls apiFetch with correct URL', async () => {
    const { apiFetch } = await import('@/api');
    await import('@/composables/useStartConversation');

    const mutationFn = (globalThis as Record<string, unknown>).__testMutationFn as (
      username: string,
    ) => Promise<unknown>;

    if (mutationFn) {
      await mutationFn('testuser');
      expect(apiFetch).toHaveBeenCalledWith('/api/conversations/with/testuser', {
        method: 'POST',
      });
    }
  });

  it('mutationFn returns conversation data', async () => {
    await import('@/composables/useStartConversation');

    const mutationFn = (globalThis as Record<string, unknown>).__testMutationFn as (
      username: string,
    ) => Promise<unknown>;

    if (mutationFn) {
      const result = await mutationFn('testuser');
      expect(result).toEqual({ id: 'new-conv', participant: { username: 'testuser' } });
    }
  });

  it('onSuccess adds new conversation to cache', async () => {
    await import('@/composables/useStartConversation');

    const onSuccess = (globalThis as Record<string, unknown>).__testOnSuccess as (newConversation: {
      id: string;
    }) => void;

    if (onSuccess) {
      const newConversation = { id: 'new-conv' };
      onSuccess(newConversation);

      expect(mockSetQueryData).toHaveBeenCalledWith(['dm-conversations'], expect.any(Function));
    }
  });

  it('onSuccess creates initial cache structure when no cache exists', async () => {
    await import('@/composables/useStartConversation');

    const onSuccess = (globalThis as Record<string, unknown>).__testOnSuccess as (newConversation: {
      id: string;
    }) => void;

    if (onSuccess) {
      const newConversation = { id: 'new-conv', participant: { username: 'testuser' } };

      // Get the update function passed to setQueryData
      mockSetQueryData.mockImplementation((key, updaterFn) => {
        // Call updater with null (no existing cache)
        const result = updaterFn(null);
        expect(result).toEqual({
          pages: [
            {
              success: true,
              data: [newConversation],
              pagination: { hasNextPage: false },
            },
          ],
          pageParams: [undefined],
        });
      });

      onSuccess(newConversation);
    }
  });

  it('onSuccess does not duplicate existing conversation', async () => {
    await import('@/composables/useStartConversation');

    const onSuccess = (globalThis as Record<string, unknown>).__testOnSuccess as (newConversation: {
      id: string;
    }) => void;

    if (onSuccess) {
      const existingConversation = { id: 'existing-conv' };
      const existingCache = {
        pages: [{ data: [existingConversation] }],
        pageParams: [undefined],
      };

      mockSetQueryData.mockImplementation((key, updaterFn) => {
        // Call updater with existing cache that already has the conversation
        const result = updaterFn(existingCache);
        // Should return unchanged data since conversation already exists
        expect(result).toEqual(existingCache);
      });

      onSuccess(existingConversation);
    }
  });

  it('onSuccess adds conversation to beginning of first page', async () => {
    await import('@/composables/useStartConversation');

    const onSuccess = (globalThis as Record<string, unknown>).__testOnSuccess as (newConversation: {
      id: string;
    }) => void;

    if (onSuccess) {
      const newConversation = { id: 'new-conv' };
      const existingConversation = { id: 'existing-conv' };
      const existingCache = {
        pages: [{ data: [existingConversation] }],
        pageParams: [undefined],
      };

      mockSetQueryData.mockImplementation((key, updaterFn) => {
        const result = updaterFn(existingCache);
        // New conversation should be at the beginning
        expect(result.pages[0].data[0]).toEqual(newConversation);
        expect(result.pages[0].data[1]).toEqual(existingConversation);
      });

      onSuccess(newConversation);
    }
  });

  it('onSuccess preserves other pages when adding to first page', async () => {
    await import('@/composables/useStartConversation');

    const onSuccess = (globalThis as Record<string, unknown>).__testOnSuccess as (newConversation: {
      id: string;
    }) => void;

    if (onSuccess) {
      const newConversation = { id: 'new-conv' };
      const existingCache = {
        pages: [{ data: [{ id: 'conv-1' }] }, { data: [{ id: 'conv-2' }] }],
        pageParams: [undefined, 'cursor-1'],
      };

      mockSetQueryData.mockImplementation((key, updaterFn) => {
        const result = updaterFn(existingCache);
        // First page should have new conversation prepended
        expect(result.pages[0].data.length).toBe(2);
        // Second page should be unchanged
        expect(result.pages[1].data).toEqual([{ id: 'conv-2' }]);
      });

      onSuccess(newConversation);
    }
  });
});
