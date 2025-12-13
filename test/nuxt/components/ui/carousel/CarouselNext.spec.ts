import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, defineComponent, h } from 'vue';
import CarouselNext from '~/components/ui/carousel/CarouselNext.vue';

// Mock the useCarousel composable
const mockOrientation = ref<'horizontal' | 'vertical'>('horizontal');
const mockCanScrollNext = ref(true);
const mockScrollNext = vi.fn();

vi.mock('~/components/ui/carousel/useCarousel', () => ({
  useCarousel: vi.fn(() => ({
    orientation: mockOrientation,
    canScrollNext: mockCanScrollNext,
    scrollNext: mockScrollNext,
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
        'ui.carousel.next.icon': 'lucide:arrow-right',
        'ui.carousel.next.label': 'Next slide',
      };
      return translations[key] || key;
    },
  },
};

describe('CarouselNext.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrientation.value = 'horizontal';
    mockCanScrollNext.value = true;
  });

  it('renders with data-slot attribute', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    expect(wrapper.find('[data-slot="carousel-next"]').exists()).toBe(true);
  });

  it('renders when canScrollNext is true', () => {
    mockCanScrollNext.value = true;

    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.exists()).toBe(true);
    expect(button.isVisible()).toBe(true);
  });

  it('is hidden when canScrollNext is false', () => {
    mockCanScrollNext.value = false;

    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    // v-show makes element hidden but still in DOM
    expect(button.exists()).toBe(true);
    // The button uses v-show which sets display: none
    expect(button.attributes('style')).toContain('display: none');
  });

  it('calls scrollNext when clicked', async () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    await wrapper.find('[data-slot="carousel-next"]').trigger('click');
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });

  it('uses default variant and size props', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.attributes('data-variant')).toBe('outline');
    expect(button.attributes('data-size')).toBe('icon-xs');
  });

  it('accepts custom variant prop', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
      props: {
        variant: 'default',
      },
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.attributes('data-variant')).toBe('default');
  });

  it('accepts custom size prop', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
      props: {
        size: 'icon-sm',
      },
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.attributes('data-size')).toBe('icon-sm');
  });

  it('applies horizontal position classes when orientation is horizontal', () => {
    mockOrientation.value = 'horizontal';

    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.classes()).toContain('end-2');
    expect(button.classes()).toContain('top-1/2');
    expect(button.classes()).toContain('-translate-y-1/2');
  });

  it('applies vertical position classes when orientation is vertical', () => {
    mockOrientation.value = 'vertical';

    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.classes()).toContain('start-1/2');
    expect(button.classes()).toContain('-bottom-12');
    expect(button.classes()).toContain('-translate-x-1/2');
    expect(button.classes()).toContain('rotate-90');
  });

  it('has base styling classes', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.classes()).toContain('absolute');
    expect(button.classes()).toContain('z-10');
    expect(button.classes()).toContain('size-8');
    expect(button.classes()).toContain('rounded-full');
    expect(button.classes()).toContain('shadow');
  });

  it('renders default icon and label', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
    });

    // Check that sr-only label exists
    expect(wrapper.find('.sr-only').exists()).toBe(true);
    expect(wrapper.find('.sr-only').text()).toBe('Next slide');
  });

  it('renders custom slot content', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
      slots: {
        default: '<span class="custom-icon">→</span>',
      },
    });

    expect(wrapper.find('.custom-icon').exists()).toBe(true);
    expect(wrapper.find('.custom-icon').text()).toBe('→');
  });

  it('applies custom class', () => {
    const wrapper = mount(CarouselNext, {
      global: globalConfig,
      props: {
        class: 'custom-next-class',
      },
    });

    const button = wrapper.find('[data-slot="carousel-next"]');
    expect(button.classes()).toContain('custom-next-class');
  });
});
