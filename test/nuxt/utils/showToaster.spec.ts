// tests/nuxt/utils/showToaster.spec.ts  (or wherever your spec is)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showToaster } from '@/utils/showToaster';
import { toast } from 'vue-sonner';

// Properly mock useNuxtApp using the recommended Nuxt test-utils approach
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// Mock vue-sonner with the legacy typed methods (success, error, etc.)
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $i18n: {
      t: vi.fn((msg: string) => `[translated: ${msg}]`),
    },
  });
});

describe('showToaster utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toast.success with raw message when translate is false', () => {
    showToaster('success', 'Operation successful!');

    expect(toast.success).toHaveBeenCalledWith('Operation successful!');
  });

  it('calls toast.error correctly', () => {
    showToaster('error', 'Something went wrong!');

    expect(toast.error).toHaveBeenCalledWith('Something went wrong!');
  });

  it('calls toast.warning correctly', () => {
    showToaster('warning', 'Be careful!');

    expect(toast.warning).toHaveBeenCalledWith('Be careful!');
  });

  it('calls toast.info correctly', () => {
    showToaster('info', 'Here is some info');

    expect(toast.info).toHaveBeenCalledWith('Here is some info');
  });
});
