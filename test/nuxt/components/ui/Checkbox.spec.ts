import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Checkbox from '@/components/ui/Checkbox.vue';

describe('Checkbox Component', () => {
  it('renders successfully', async () => {
    const wrapper = await mountSuspended(Checkbox);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-slot')).toBe('checkbox');
    const classes = wrapper.classes();
    expect(classes).toContain('size-5');
  });
});
