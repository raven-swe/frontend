import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useTheme } from '@/composables/useTheme';

// Helper component to test the composable
const TestComponent = defineComponent({
  setup() {
    const theme = useTheme();
    return { theme };
  },
  render() {
    return h('div', { id: 'test' });
  },
});

describe('useTheme', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        Reflect.deleteProperty(localStorageMock, key);
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn(),
      length: 0,
    };

    // Reset document classes
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with light mode by default', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    expect(theme.mode.value).toBe('light');
  });

  it('toggles theme from light to dark', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    expect(theme.mode.value).toBe('light');

    theme.toggleTheme();

    expect(theme.mode.value).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles theme from dark to light', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    // Set to dark first
    theme.mode.value = 'dark';
    theme.toggleTheme();

    expect(theme.mode.value).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('saves theme preference to localStorage', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    theme.toggleTheme();

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('loads saved theme from localStorage on mount', () => {
    localStorageMock['theme'] = 'dark';

    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    expect(theme.mode.value).toBe('dark');
  });

  it('loads light theme from localStorage on mount', () => {
    localStorageMock['theme'] = 'light';

    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    expect(theme.mode.value).toBe('light');
  });

  it('ignores invalid theme values from localStorage', () => {
    localStorageMock['theme'] = 'invalid-theme';

    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    // Should remain at default 'light' mode
    expect(theme.mode.value).toBe('light');
  });

  it('adds dark class to html element when dark mode is active', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    theme.mode.value = 'dark';

    // Wait for watchEffect to run
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        resolve(undefined);
      }, 50);
    });
  });

  it('removes dark class from html element when light mode is active', () => {
    document.documentElement.classList.add('dark');

    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    theme.mode.value = 'light';

    // Wait for watchEffect to run
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        resolve(undefined);
      }, 50);
    });
  });

  it('reactively updates html class when mode changes', () => {
    const wrapper = mount(TestComponent);
    const { theme } = wrapper.vm;

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    theme.toggleTheme();

    // Wait for watchEffect to run
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        theme.toggleTheme();

        setTimeout(() => {
          expect(document.documentElement.classList.contains('dark')).toBe(false);
          resolve(undefined);
        }, 50);
      }, 50);
    });
  });
});
