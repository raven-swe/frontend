import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.stubGlobal('definePageMeta', () => {});
vi.stubGlobal('$t', (k: string) => k);

describe('Home - following page (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mounts and renders root element', async () => {
    const Following = (await import('@/pages/home/following.vue')).default;

    const wrapper = mount(Following, {
      global: {
        stubs: {},
        mocks: { $t: (k: string) => k },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('div').exists()).toBe(true);
  });
});
