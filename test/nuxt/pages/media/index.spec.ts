import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
// Mock vue-router to observe replace navigation with a shared mock router
const mockRouter = { replace: vi.fn() };
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

describe('pages/media/index.vue', () => {
  it('redirects to /home/following on enter', async () => {
    const { default: MediaIndexPage } = await import('@/pages/media/index.vue');
    // Router is the shared mock above
    const wrapper = await mountSuspended(MediaIndexPage, {
      global: { stubs: { Icon: true } },
    });
    // Ensure any pending navigation triggers
    await wrapper.vm?.$nextTick?.();
    // Assert redirect was called on router.replace
    expect(mockRouter.replace).toHaveBeenCalledWith('/home/following');
  });
});
