import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Spinner from '~/components/ui/Spinner.vue';

describe('Spinner', () => {
  it('renders the spinner with default classes', async () => {
    const wrapper = await mountSuspended(Spinner, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    const icon = wrapper.find('svg');
    expect(icon.exists()).toBe(true);
    // defaults
    expect(icon.attributes('role')).toBe('status');
    expect(icon.classes()).toContain('animate-spin');
    expect(icon.classes()).toContain('size-4');
  });

  it('applies custom classes to the spinner', async () => {
    const customClass = 'text-blue-500';
    const wrapper = await mountSuspended(Spinner, {
      props: {
        class: customClass,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    const icon = wrapper.find('svg');
    expect(icon.classes()).toContain(customClass);
  });
});
