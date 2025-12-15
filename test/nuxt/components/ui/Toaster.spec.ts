import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Toaster from '@/components/ui/Toaster.vue';

// Mock vue-sonner components and functions
vi.mock('vue-sonner', () => ({
  toast: vi.fn(),
  Toaster: {
    name: 'Sonner',
    template: '<div class="mock-sonner"><slot /></div>',
  },
}));

describe('Toaster Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default position (bottom-right)', async () => {
    const wrapper = await mountSuspended(Toaster);
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('bottom-4');
    expect(classes).toContain('right-4');
  });

  it('renders with position top-left', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'top-left' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('top-4');
    expect(classes).toContain('left-4');
  });

  it('renders with position top-center', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'top-center' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('top-4');
    expect(classes).toContain('left-1/2');
    expect(classes).toContain('-translate-x-1/2');
  });

  it('renders with position bottom-center', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'bottom-center' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('bottom-4');
    expect(classes).toContain('left-1/2');
    expect(classes).toContain('-translate-x-1/2');
  });
});
