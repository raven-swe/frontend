import { describe, it, expect } from 'vitest';
import type {
  CarouselProps,
  CarouselEmits,
  WithClassAsProps,
  UnwrapRefCarouselApi,
} from '~/components/ui/carousel/interface';

describe('Carousel Interface Types', () => {
  describe('CarouselProps', () => {
    it('should allow horizontal orientation', () => {
      const props: CarouselProps = {
        orientation: 'horizontal',
      };
      expect(props.orientation).toBe('horizontal');
    });

    it('should allow vertical orientation', () => {
      const props: CarouselProps = {
        orientation: 'vertical',
      };
      expect(props.orientation).toBe('vertical');
    });

    it('should allow empty props', () => {
      const props: CarouselProps = {};
      expect(props.opts).toBeUndefined();
      expect(props.plugins).toBeUndefined();
      expect(props.orientation).toBeUndefined();
    });

    it('should allow opts configuration', () => {
      const props: CarouselProps = {
        opts: {
          loop: true,
          align: 'start',
        },
      };
      expect(props.opts).toBeDefined();
    });
  });

  describe('WithClassAsProps', () => {
    it('should allow string class', () => {
      const props: WithClassAsProps = {
        class: 'my-class another-class',
      };
      expect(props.class).toBe('my-class another-class');
    });

    it('should allow undefined class', () => {
      const props: WithClassAsProps = {};
      expect(props.class).toBeUndefined();
    });

    it('should allow array class', () => {
      const props: WithClassAsProps = {
        class: ['class1', 'class2'],
      };
      expect(Array.isArray(props.class)).toBe(true);
    });

    it('should allow object class', () => {
      const props: WithClassAsProps = {
        class: { active: true, disabled: false },
      };
      expect(typeof props.class).toBe('object');
    });
  });

  describe('CarouselEmits', () => {
    it('should define init-api event type', () => {
      // Type check - this validates the emit signature exists
      const emitFn: CarouselEmits = (event: 'init-api', payload: UnwrapRefCarouselApi) => {
        expect(event).toBe('init-api');
        expect(payload).toBeDefined();
      };

      // Call to satisfy the type
      emitFn('init-api', {} as UnwrapRefCarouselApi);
    });
  });

  describe('Type Safety', () => {
    it('should enforce valid orientation values', () => {
      // Valid orientations
      const horizontal: CarouselProps['orientation'] = 'horizontal';
      const vertical: CarouselProps['orientation'] = 'vertical';

      expect(horizontal).toBe('horizontal');
      expect(vertical).toBe('vertical');
    });

    it('should combine CarouselProps with WithClassAsProps', () => {
      const combined: CarouselProps & WithClassAsProps = {
        orientation: 'horizontal',
        class: 'carousel-container',
        opts: { loop: true },
      };

      expect(combined.orientation).toBe('horizontal');
      expect(combined.class).toBe('carousel-container');
      expect(combined.opts).toBeDefined();
    });
  });
});
