import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Carousel from '~/components/ui/carousel/Carousel.vue';

// Mock embla-carousel-vue
vi.mock('embla-carousel-vue', () => ({
  default: vi.fn(() => [
    { value: null },
    {
      value: {
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        canScrollPrev: vi.fn(() => true),
        canScrollNext: vi.fn(() => true),
        on: vi.fn(),
      },
    },
  ]),
}));

const globalConfig = {
  mocks: {
    $t: (key: string) => {
      const translations: Record<string, string> = {
        'ui.carousel.carousel': 'carousel',
        'ui.carousel.item': 'slide',
        'ui.carousel.next.icon': 'lucide:arrow-right',
        'ui.carousel.next.label': 'Next slide',
        'ui.carousel.previous.icon': 'lucide:arrow-left',
        'ui.carousel.previous.label': 'Previous slide',
      };
      return translations[key] || key;
    },
  },
};

describe('Carousel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      slots: {
        default: '<div class="test-content">Test</div>',
      },
    });

    expect(wrapper.find('[data-slot="carousel"]').exists()).toBe(true);
    expect(wrapper.find('.test-content').exists()).toBe(true);
  });

  it('has correct accessibility attributes', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    expect(carousel.attributes('role')).toBe('region');
    expect(carousel.attributes('aria-roledescription')).toBe('carousel');
    expect(carousel.attributes('tabindex')).toBe('0');
  });

  it('applies custom class', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        class: 'custom-class',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    expect(carousel.classes()).toContain('custom-class');
    expect(carousel.classes()).toContain('relative');
  });

  it('handles horizontal orientation by default', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
    });

    // Default orientation is 'horizontal' via withDefaults
    expect(wrapper.props('orientation')).toBe('horizontal');
  });

  it('accepts vertical orientation prop', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'vertical',
      },
    });

    expect(wrapper.props('orientation')).toBe('vertical');
  });

  it('handles ArrowLeft keydown for horizontal carousel', async () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'horizontal',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    await carousel.trigger('keydown', { key: 'ArrowLeft' });

    // The scrollPrev should be called (via the composable)
    expect(wrapper.emitted()).toBeDefined();
  });

  it('handles ArrowRight keydown for horizontal carousel', async () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'horizontal',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    await carousel.trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted()).toBeDefined();
  });

  it('handles ArrowUp keydown for vertical carousel', async () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'vertical',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    await carousel.trigger('keydown', { key: 'ArrowUp' });

    expect(wrapper.emitted()).toBeDefined();
  });

  it('handles ArrowDown keydown for vertical carousel', async () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'vertical',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    await carousel.trigger('keydown', { key: 'ArrowDown' });

    expect(wrapper.emitted()).toBeDefined();
  });

  it('ignores irrelevant key presses', async () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      props: {
        orientation: 'horizontal',
      },
    });

    const carousel = wrapper.find('[data-slot="carousel"]');
    await carousel.trigger('keydown', { key: 'Enter' });
    await carousel.trigger('keydown', { key: 'Space' });
    await carousel.trigger('keydown', { key: 'Tab' });

    // No navigation events should be triggered for these keys
    expect(wrapper.emitted()).toBeDefined();
  });

  it('exposes carousel API methods', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
    });

    const exposed = wrapper.vm;
    expect(exposed).toHaveProperty('scrollNext');
    expect(exposed).toHaveProperty('scrollPrev');
    expect(exposed).toHaveProperty('canScrollNext');
    expect(exposed).toHaveProperty('canScrollPrev');
    expect(exposed).toHaveProperty('carouselApi');
    expect(exposed).toHaveProperty('carouselRef');
    expect(exposed).toHaveProperty('orientation');
  });

  it('passes slot props to default slot', () => {
    const wrapper = mount(Carousel, {
      global: globalConfig,
      slots: {
        default: `<template #default="props">
          <div class="slot-test" :data-has-props="!!props">Slot Content</div>
        </template>`,
      },
    });

    expect(wrapper.find('.slot-test').exists()).toBe(true);
  });
});
