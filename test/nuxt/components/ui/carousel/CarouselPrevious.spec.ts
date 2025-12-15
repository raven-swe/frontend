import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, defineComponent, h } from 'vue';
import CarouselPrevious from '~/components/ui/carousel/CarouselPrevious.vue';

// Mock the useCarousel composable
const mockOrientation = ref<'horizontal' | 'vertical'>('horizontal');
const mockCanScrollPrev = ref(true);
const mockScrollPrev = vi.fn();

vi.mock('~/components/ui/carousel/useCarousel', () => ({
  useCarousel: vi.fn(() => ({
    orientation: mockOrientation,
    canScrollPrev: mockCanScrollPrev,
    scrollPrev: mockScrollPrev,
  })),
}));

const stubs = {
  UiButton: defineComponent({
    props: ['variant', 'size'],
    inheritAttrs: false,
    setup(props, { slots, attrs }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            'data-variant': props.variant,
            'data-size': props.size,
          },
          slots.default?.(),
        );
    },
  }),
  Icon: {
    template: '<i :class="name" />',
    props: ['name', 'size'],
  },
};

const globalConfig = {
  stubs,
  mocks: {
    $t: (key: string) => {
      const translations: Record<string, string> = {
        'ui.carousel.previous.icon': 'lucide:arrow-left',
        'ui.carousel.previous.label': 'Previous slide',
      };
      return translations[key] || key;
    },
  },
};

describe('CarouselPrevious.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrientation.value = 'horizontal';
    mockCanScrollPrev.value = true;
  });

  it('renders with data-slot attribute', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    expect(wrapper.find('[data-slot="carousel-previous"]').exists()).toBe(true);
  });

  it('renders when canScrollPrev is true', () => {
    mockCanScrollPrev.value = true;

    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.exists()).toBe(true);
    expect(button.isVisible()).toBe(true);
  });

  it('is hidden when canScrollPrev is false', () => {
    mockCanScrollPrev.value = false;

    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    // v-show makes element hidden but still in DOM
    expect(button.exists()).toBe(true);
    // The button uses v-show which sets display: none
    expect(button.attributes('style')).toContain('display: none');
  });

  it('calls scrollPrev when clicked', async () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    await wrapper.find('[data-slot="carousel-previous"]').trigger('click');
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);
  });

  it('uses default variant and size props', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.attributes('data-variant')).toBe('outline');
    expect(button.attributes('data-size')).toBe('icon-xs');
  });

  it('accepts custom variant prop', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
      props: {
        variant: 'default',
      },
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.attributes('data-variant')).toBe('default');
  });

  it('accepts custom size prop', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
      props: {
        size: 'icon-sm',
      },
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.attributes('data-size')).toBe('icon-sm');
  });

  it('applies horizontal position classes when orientation is horizontal', () => {
    mockOrientation.value = 'horizontal';

    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.classes()).toContain('start-2');
    expect(button.classes()).toContain('top-1/2');
    expect(button.classes()).toContain('-translate-y-1/2');
  });

  it('applies vertical position classes when orientation is vertical', () => {
    mockOrientation.value = 'vertical';

    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.classes()).toContain('start-1/2');
    expect(button.classes()).toContain('-top-12');
    expect(button.classes()).toContain('-translate-x-1/2');
    expect(button.classes()).toContain('rotate-90');
  });

  it('has base styling classes', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.classes()).toContain('absolute');
    expect(button.classes()).toContain('z-10');
    expect(button.classes()).toContain('size-8');
    expect(button.classes()).toContain('rounded-full');
    expect(button.classes()).toContain('shadow');
  });

  it('renders default icon and label', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
    });

    // Check that sr-only label exists
    expect(wrapper.find('.sr-only').exists()).toBe(true);
    expect(wrapper.find('.sr-only').text()).toBe('Previous slide');
  });

  it('renders custom slot content', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
      slots: {
        default: '<span class="custom-icon">←</span>',
      },
    });

    expect(wrapper.find('.custom-icon').exists()).toBe(true);
    expect(wrapper.find('.custom-icon').text()).toBe('←');
  });

  it('applies custom class', () => {
    const wrapper = mount(CarouselPrevious, {
      global: globalConfig,
      props: {
        class: 'custom-prev-class',
      },
    });

    const button = wrapper.find('[data-slot="carousel-previous"]');
    expect(button.classes()).toContain('custom-prev-class');
  });
});
