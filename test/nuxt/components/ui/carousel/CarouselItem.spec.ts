import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CarouselItem from '~/components/ui/carousel/CarouselItem.vue';
import { ref } from 'vue';

// Mock the useCarousel composable
const mockOrientation = ref('horizontal');

vi.mock('~/components/ui/carousel/useCarousel', () => ({
  useCarousel: vi.fn(() => ({
    orientation: mockOrientation,
  })),
}));

const globalConfig = {
  mocks: {
    $t: (key: string) => {
      const translations: Record<string, string> = {
        'ui.carousel.carousel': 'carousel',
        'ui.carousel.item': 'slide',
      };
      return translations[key] || key;
    },
  },
};

describe('CarouselItem.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrientation.value = 'horizontal';
  });

  it('renders with data-slot attribute', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
    });

    expect(wrapper.find('[data-slot="carousel-item"]').exists()).toBe(true);
  });

  it('has correct accessibility attributes', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.attributes('role')).toBe('group');
    expect(item.attributes('aria-roledescription')).toBe('slide');
  });

  it('renders slot content', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
      slots: {
        default: '<div class="test-content">Slide Content</div>',
      },
    });

    expect(wrapper.find('.test-content').exists()).toBe(true);
    expect(wrapper.find('.test-content').text()).toBe('Slide Content');
  });

  it('has base classes for carousel item', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.classes()).toContain('min-w-0');
    expect(item.classes()).toContain('shrink-0');
    expect(item.classes()).toContain('grow-0');
    expect(item.classes()).toContain('basis-full');
  });

  it('applies horizontal padding when orientation is horizontal', () => {
    mockOrientation.value = 'horizontal';

    const wrapper = mount(CarouselItem, {
      global: globalConfig,
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.classes()).toContain('pl-4');
    expect(item.classes()).not.toContain('pt-4');
  });

  it('applies vertical padding when orientation is vertical', () => {
    mockOrientation.value = 'vertical';

    const wrapper = mount(CarouselItem, {
      global: globalConfig,
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.classes()).toContain('pt-4');
    expect(item.classes()).not.toContain('pl-4');
  });

  it('applies custom class', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
      props: {
        class: 'custom-item-class',
      },
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.classes()).toContain('custom-item-class');
  });

  it('renders complex slot content', () => {
    const wrapper = mount(CarouselItem, {
      global: globalConfig,
      slots: {
        default: `
          <img src="/test.jpg" alt="Test" class="item-image" />
          <h3 class="item-title">Title</h3>
          <p class="item-description">Description</p>
        `,
      },
    });

    expect(wrapper.find('.item-image').exists()).toBe(true);
    expect(wrapper.find('.item-title').exists()).toBe(true);
    expect(wrapper.find('.item-description').exists()).toBe(true);
  });

  it('merges custom class with default classes', () => {
    mockOrientation.value = 'horizontal';

    const wrapper = mount(CarouselItem, {
      global: globalConfig,
      props: {
        class: 'my-custom-class another-class',
      },
    });

    const item = wrapper.find('[data-slot="carousel-item"]');
    expect(item.classes()).toContain('min-w-0');
    expect(item.classes()).toContain('shrink-0');
    expect(item.classes()).toContain('grow-0');
    expect(item.classes()).toContain('basis-full');
    expect(item.classes()).toContain('pl-4');
    expect(item.classes()).toContain('my-custom-class');
    expect(item.classes()).toContain('another-class');
  });
});
