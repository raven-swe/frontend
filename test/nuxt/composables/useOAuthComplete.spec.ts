import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOAuthComplete } from '@/composables/useOAuthComplete';

const mockRouter = { push: vi.fn() };
vi.mock('vue-router', () => ({ useRouter: () => mockRouter }));

describe('useOAuthComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits and redirects on success', async () => {
    globalThis.$fetch = vi
      .fn()
      .mockResolvedValue({ success: true }) as unknown as typeof globalThis.$fetch;
    const { submit, loading, error, result } = useOAuthComplete();
    await submit('mocktoken', '2000-01-01');
    expect(globalThis.$fetch).toHaveBeenCalledWith(
      '/api/oauth/complete',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/home');
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(result.value?.success).toBe(true);
  });

  it('does not redirect when success is false', async () => {
    globalThis.$fetch = vi
      .fn()
      .mockResolvedValue({ success: false }) as unknown as typeof globalThis.$fetch;
    const { submit, loading, error } = useOAuthComplete();
    await submit('mocktoken', '2000-01-01');
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('handles error when Error instance is thrown', async () => {
    const errorMessage = 'Network error';
    globalThis.$fetch = vi
      .fn()
      .mockRejectedValue(new Error(errorMessage)) as unknown as typeof globalThis.$fetch;
    const { submit, loading, error } = useOAuthComplete();
    await submit('mocktoken', '2000-01-01');
    expect(loading.value).toBe(false);
    expect(error.value).toBe(errorMessage);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles error when non-Error is thrown', async () => {
    globalThis.$fetch = vi
      .fn()
      .mockRejectedValue('String error') as unknown as typeof globalThis.$fetch;
    const { submit, loading, error } = useOAuthComplete();
    await submit('mocktoken', '2000-01-01');
    expect(loading.value).toBe(false);
    expect(error.value).toBe('Unknown error');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
