import { describe, it, expect, beforeEach, vi } from 'vitest';
import HoverCard from '~/components/ui/hover-card/HoverCard.vue';
import HoverCardTrigger from '~/components/ui/hover-card/HoverCardTrigger.vue';
import HoverCardContent from '~/components/ui/hover-card/HoverCardContent.vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises, type VueWrapper } from '@vue/test-utils';

describe('HoverCard Components', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('HoverCard.vue', () => {
    it('pass props and slots correctly', async () => {
      const wrapper = await mountSuspended(HoverCard, {
        props: {
          openDelay: 100,
          closeDelay: 200,
        },
        slots: {
          default: () => 'Test Content',
        },
      });
      expect(wrapper.text()).toContain('Test Content');
      expect(wrapper.props().openDelay).toBe(100);
      expect(wrapper.props().closeDelay).toBe(200);
    });

    it('forwards emits', async () => {
      const wrapper = await mountSuspended(HoverCard, {
        global: {
          stubs: {
            HoverCardRoot: {
              template: '<button @click="$emit(\'open\')"></button>',
            },
          },
        },
      });

      const root = wrapper.findComponent('button') as VueWrapper;
      // emit from the child component instance
      root.vm.$emit('open');
      expect(wrapper.emitted().open).toBeTruthy();
    });
  });

  describe('HoverCardTrigger.vue', () => {
    it('should render HoverCardTrigger with slot data', async () => {
      const wrapper = await mountSuspended({
        components: {
          HoverCardTrigger,
          HoverCard,
        },
        template: `
					<HoverCard>
						<HoverCardTrigger>
							Trigger
						</HoverCardTrigger>
					</HoverCard>
				`,
      });

      expect(wrapper.find('[data-slot="hover-card-trigger"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Trigger');
    });
  });

  describe('HoverCardContent.vue', () => {
    it('should render HoverCardContent', async () => {
      await mountSuspended({
        components: {
          HoverCardTrigger,
          HoverCard,
          HoverCardContent,
        },
        template: `
					<HoverCard :open="true">
						<HoverCardTrigger>
							Trigger
						</HoverCardTrigger>
						<HoverCardContent>
							Content
						</HoverCardContent>
					</HoverCard>
				`,
      });
      await flushPromises();
      expect(document.body.querySelector('[data-slot="hover-card-content"]')).toBeTruthy();
    });
  });
});
