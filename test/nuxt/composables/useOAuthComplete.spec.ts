import { describe, it, expect, vi } from 'vitest';
import { useOAuthComplete } from '@/composables/useOAuthComplete';

const mockRouter = { push: vi.fn() };
vi.mock('vue-router', () => ({ useRouter: () => mockRouter }));

describe('useOAuthComplete', () => {
  it('submits and redirects on success', async () => {
    globalThis.$fetch = vi.fn().mockResolvedValue({ success: true });
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
});
