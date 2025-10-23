import { describe, it, vi, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import GithubCallbackPage from '@/pages/auth/callback/github/index.vue';
import OAuthCompleteForm from '@/components/ui/OAuthCompleteForm.vue';

describe('GitHub Callback Page', () => {
  it('renders OAuthCompleteForm when creationToken is present', async () => {
    globalThis.$fetch = vi.fn().mockResolvedValue({
      data: { creationToken: 'mocktoken' },
    });
    const wrapper = await mountSuspended(GithubCallbackPage, {
      route: { query: { code: 'testcode' } },
    });
    expect(wrapper.findComponent(OAuthCompleteForm).exists()).toBe(true);
  });
});
