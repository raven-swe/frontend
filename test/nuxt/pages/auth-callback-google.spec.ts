import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import GoogleCallbackPage from '@/pages/auth/callback/google/index.vue';
import OAuthCompleteForm from '@/components/ui/OAuthCompleteForm.vue';

describe('Google Callback Page', () => {
  it('renders OAuthCompleteForm when creationToken is present', async () => {
    globalThis.$fetch = vi.fn().mockResolvedValue({
      data: { creationToken: 'mocktoken' },
    });

    const wrapper = await mountSuspended(GoogleCallbackPage, {
      route: { query: { code: 'testcode' } },
    });

    expect(wrapper.findComponent(OAuthCompleteForm).exists()).toBe(true);
  });
});
