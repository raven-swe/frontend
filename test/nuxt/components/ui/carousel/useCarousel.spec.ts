import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { useCarousel, useProvideCarousel } from '~/components/ui/carousel/useCarousel';

// Mock embla-carousel-vue
const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();
const mockCanScrollPrev = vi.fn(() => true);
const mockCanScrollNext = vi.fn(() => true);
const mockOn = vi.fn();

const mockEmblaApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  on: mockOn,
};

vi.mock('embla-carousel-vue', () => ({
  default: vi.fn(() => [ref(null), ref(mockEmblaApi)]),
}));

describe('useCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCarousel (inject)', () => {
    it('throws error when used outside of Carousel provider', () => {
      const TestComponent = defineComponent({
        setup() {
          // This should throw
          useCarousel();
          return () => h('div');
        },
      });

      expect(() => mount(TestComponent)).toThrow();
    });
  });

  describe('useProvideCarousel', () => {
    it('returns carousel state and methods', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal' }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);

      expect(result).toHaveProperty('carouselRef');
      expect(result).toHaveProperty('carouselApi');
      expect(result).toHaveProperty('canScrollPrev');
      expect(result).toHaveProperty('canScrollNext');
      expect(result).toHaveProperty('scrollPrev');
      expect(result).toHaveProperty('scrollNext');
      expect(result).toHaveProperty('orientation');
    });

    it('returns correct orientation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let horizontalResult: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let verticalResult: any = null;

      const HorizontalComponent = defineComponent({
        setup() {
          horizontalResult = useProvideCarousel({ orientation: 'horizontal' }, vi.fn());
          return () => h('div');
        },
      });

      const VerticalComponent = defineComponent({
        setup() {
          verticalResult = useProvideCarousel({ orientation: 'vertical' }, vi.fn());
          return () => h('div');
        },
      });

      mount(HorizontalComponent);
      mount(VerticalComponent);

      expect(horizontalResult?.orientation).toBe('horizontal');
      expect(verticalResult?.orientation).toBe('vertical');
    });

    it('provides scrollPrev function', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal' }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);

      expect(typeof result?.scrollPrev).toBe('function');
      result?.scrollPrev();
      expect(mockScrollPrev).toHaveBeenCalled();
    });

    it('provides scrollNext function', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal' }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);

      expect(typeof result?.scrollNext).toBe('function');
      result?.scrollNext();
      expect(mockScrollNext).toHaveBeenCalled();
    });

    it('initializes canScrollPrev and canScrollNext as false', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal' }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);

      // Initial values before embla events fire
      expect(result?.canScrollPrev.value).toBe(false);
      expect(result?.canScrollNext.value).toBe(false);
    });

    it('accepts carousel options', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;
      const opts = {
        loop: true,
        align: 'start' as const,
      };

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal', opts }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);
      expect(result).toBeDefined();
    });

    it('accepts carousel plugins', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;
      const plugins: never[] = [];

      const TestComponent = defineComponent({
        setup() {
          result = useProvideCarousel({ orientation: 'horizontal', plugins }, vi.fn());
          return () => h('div');
        },
      });

      mount(TestComponent);
      expect(result).toBeDefined();
    });
  });
});
