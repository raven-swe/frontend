import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Toaster from '@/components/ui/Toaster.vue';
import { showToaster } from '@/utils/showToaster';
import { toast } from 'vue-sonner';

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
    expect(classes).toContain('bottom-0');
    expect(classes).toContain('right-0');
  });

  it('renders with position top-left', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'top-left' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('top-0');
    expect(classes).toContain('left-0');
  });

  it('renders with position top-center', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'top-center' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('top-0');
    expect(classes).toContain('-translate-x-1/2');
  });

  it('renders with position bottom-center', async () => {
    const wrapper = await mountSuspended(Toaster, {
      props: { position: 'bottom-center' },
    });
    const classes = wrapper.classes().join(' ');
    expect(classes).toContain('bottom-0');
    expect(classes).toContain('-translate-x-1/2');
  });
});

describe('showToaster utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toast with success icon and styles', () => {
    showToaster('success', 'Operation successful!');
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('✔️ Operation successful!'),
      expect.objectContaining({
        style: expect.objectContaining({
          background: 'var(--toaster-bg-success)',
          color: 'var(--toaster-text-success)',
        }),
      }),
    );
  });

  it('calls toast with error icon and styles', () => {
    showToaster('error', 'Something went wrong!');
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('❌ Something went wrong!'),
      expect.objectContaining({
        style: expect.objectContaining({
          background: 'var(--toaster-bg-error)',
          color: 'var(--toaster-text-error)',
        }),
      }),
    );
  });

  it('calls toast with warning icon and styles', () => {
    showToaster('warning', 'Be careful!');
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ Be careful!'),
      expect.objectContaining({
        style: expect.objectContaining({
          background: 'var(--toaster-bg-warning)',
          color: 'var(--toaster-text-warning)',
        }),
      }),
    );
  });

  it('calls toast with info icon and styles', () => {
    showToaster('info', 'Information here!');
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('ℹ️ Information here!'),
      expect.objectContaining({
        style: expect.objectContaining({
          background: 'var(--toaster-bg-info)',
          color: 'var(--toaster-text-info)',
        }),
      }),
    );
  });
});
