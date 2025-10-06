import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Button from '@/components/ui/Button.vue';

describe('Button Component', () => {
  it('Button component renders properly', async () => {
    const wrapper = await mountSuspended(Button, {
      slots: { default: () => 'Click Me' },
    });
    expect(wrapper.html()).toContain('Click Me');
  });

  it('Button component renders properly', async () => {
    const wrapper = await mountSuspended(Button, {
      slots: { default: () => 'Click Me' },
    });
    expect(wrapper.classes()).toContain('bg-background');
    expect(wrapper.classes()).toContain('rounded-full');
  });
});
