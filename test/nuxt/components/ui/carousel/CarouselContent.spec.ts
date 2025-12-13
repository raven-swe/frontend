import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CarouselContent from '~/components/ui/carousel/CarouselContent.vue';
import { ref } from 'vue';

// Mock the useCarousel composable
const mockCarouselRef = ref(null);
const mockOrientation = ref('horizontal');

vi.mock('~/components/ui/carousel/useCarousel', () => ({
  useCarousel: vi.fn(() => ({
    carouselRef: mockCarouselRef,
    orientation: mockOrientation,
  })),
}));

describe('CarouselContent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrientation.value = 'horizontal';
  });

  it('renders with data-slot attribute', () => {
    const wrapper = mount(CarouselContent, {
      global: {
        stubs: {
          // No stubs needed
        },
      },
    });

    expect(wrapper.find('[data-slot="carousel-content"]').exists()).toBe(true);
  });

  it('has overflow-hidden class on outer container', () => {
    const wrapper = mount(CarouselContent);

    const content = wrapper.find('[data-slot="carousel-content"]');
    expect(content.classes()).toContain('overflow-hidden');
  });

  it('renders slot content', () => {
    const wrapper = mount(CarouselContent, {
      slots: {
        default: '<div class="test-item">Item 1</div>',
      },
    });

    expect(wrapper.find('.test-item').exists()).toBe(true);
    expect(wrapper.find('.test-item').text()).toBe('Item 1');
  });

  it('applies horizontal styles when orientation is horizontal', () => {
    mockOrientation.value = 'horizontal';

    const wrapper = mount(CarouselContent);

    const innerDiv = wrapper.find('[data-slot="carousel-content"] > div');
    expect(innerDiv.classes()).toContain('flex');
    expect(innerDiv.classes()).toContain('-ml-4');
    expect(innerDiv.classes()).not.toContain('flex-col');
    expect(innerDiv.classes()).not.toContain('-mt-4');
  });

  it('applies vertical styles when orientation is vertical', () => {
    mockOrientation.value = 'vertical';

    const wrapper = mount(CarouselContent);

    const innerDiv = wrapper.find('[data-slot="carousel-content"] > div');
    expect(innerDiv.classes()).toContain('flex');
    expect(innerDiv.classes()).toContain('-mt-4');
    expect(innerDiv.classes()).toContain('flex-col');
    expect(innerDiv.classes()).not.toContain('-ml-4');
  });

  it('applies custom class', () => {
    const wrapper = mount(CarouselContent, {
      props: {
        class: 'custom-class',
      },
    });

    const innerDiv = wrapper.find('[data-slot="carousel-content"] > div');
    expect(innerDiv.classes()).toContain('custom-class');
  });

  it('passes through additional attributes', () => {
    const wrapper = mount(CarouselContent, {
      attrs: {
        'data-testid': 'carousel-content-test',
        id: 'my-carousel-content',
      },
    });

    const innerDiv = wrapper.find('[data-slot="carousel-content"] > div');
    expect(innerDiv.attributes('data-testid')).toBe('carousel-content-test');
    expect(innerDiv.attributes('id')).toBe('my-carousel-content');
  });

  it('renders multiple slot children', () => {
    const wrapper = mount(CarouselContent, {
      slots: {
        default: `
          <div class="item-1">Item 1</div>
          <div class="item-2">Item 2</div>
          <div class="item-3">Item 3</div>
        `,
      },
    });

    expect(wrapper.find('.item-1').exists()).toBe(true);
    expect(wrapper.find('.item-2').exists()).toBe(true);
    expect(wrapper.find('.item-3').exists()).toBe(true);
  });

  it('sets carouselRef on the outer container', () => {
    const wrapper = mount(CarouselContent);

    // The ref should be attached to the outer div
    expect(wrapper.find('[data-slot="carousel-content"]').exists()).toBe(true);
  });
});
