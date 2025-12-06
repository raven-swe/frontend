/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Base from '@/components/notifications/Base.vue';

vi.mock('@/utils/time', () => ({
  relativeTime: (ts: string) => `relative-${ts}`,
}));

const mockActor = {
  username: 'actor1',
  avatarUrl: '/actor.jpg',
  displayName: 'Actor One',
};

describe('notifications/Base.vue', () => {
  it('renders link, icon, message, actor and relative timestamp; applies unseen class', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        message: 'Hello world',
        timestamp: '2025-01-01T00:00:00Z',
        icon: { name: 'bell', color: 'text-red-500' },
        actor: mockActor,
        linkTo: '/some/path',
        isSeen: false,
      },
      slots: {
        default: '<div data-test="slot-content">slot content</div>',
      },
      global: {
        stubs: {
          NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot/></a>' },
          Icon: {
            name: 'Icon',
            props: ['name', 'size'],
            template: '<i :data-name="name" :class="$attrs.class">{{ name }}</i>',
          },
          UserHoverCard: { name: 'UserHoverCard', template: '<div><slot/></div>' },
        },
      },
    });

    // Link href
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/some/path');

    // Icon rendered: match either the project's iconify output or the test stub
    const iconify = wrapper.find('span.iconify');
    if (iconify.exists()) {
      // project may render iconify with a class like "i-bell"
      expect(iconify.classes()).toContain('i-bell');
    } else {
      // fallback to the stubbed icon shape used in tests
      expect(wrapper.html()).toContain('data-name="bell"');
    }
    expect(wrapper.html()).toContain('text-red-500');

    // Message displayed
    expect(wrapper.html()).toContain('Hello world');

    // Actor avatar and alt
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/actor.jpg');
    expect(img.attributes('alt')).toBe('actor1');

    // Relative timestamp comes from mocked util
    expect(wrapper.html()).toContain('relative-2025-01-01T00:00:00Z');

    // Slot content rendered
    expect(wrapper.find('[data-test="slot-content"]').exists()).toBe(true);

    // Unseen class present
    expect(wrapper.html()).toContain('bg-primary/10');
  });

  it('does not render icon when icon prop is not provided', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        message: 'No icon',
        timestamp: '2025-01-02T00:00:00Z',
        actor: mockActor,
        linkTo: '/no-icon',
      },
      global: {
        stubs: {
          NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot/></a>' },
          Icon: {
            name: 'Icon',
            props: ['name', 'size'],
            template: '<i :data-name="name">{{ name }}</i>',
          },
          UserHoverCard: { name: 'UserHoverCard', template: '<div><slot/></div>' },
        },
      },
    });

    // Ensure no iconify span and no stub data-name attribute
    expect(wrapper.find('span.iconify').exists()).toBe(false);
    expect(wrapper.html()).not.toContain('data-name=');
  });

  it('does not apply unseen class when isSeen is true', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        message: 'Seen',
        timestamp: '2025-01-03T00:00:00Z',
        actor: mockActor,
        linkTo: '/seen',
        isSeen: true,
      },
      global: {
        stubs: {
          NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot/></a>' },
          Icon: {
            name: 'Icon',
            props: ['name', 'size'],
            template: '<i :data-name="name">{{ name }}</i>',
          },
          UserHoverCard: { name: 'UserHoverCard', template: '<div><slot/></div>' },
        },
      },
    });

    expect(wrapper.html()).not.toContain('bg-primary/10');
  });

  it('forwards follow, unfollow and unblock events emitted by UserHoverCard (from both cards)', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        message: 'Events',
        timestamp: '2025-01-04T00:00:00Z',
        actor: mockActor,
        linkTo: '/events',
      },
      global: {
        stubs: {
          NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot/></a>' },
          Icon: {
            name: 'Icon',
            props: ['name', 'size'],
            template: '<i :data-name="name">{{ name }}</i>',
          },
          // stub that can emit events from test via vm.$emit
          UserHoverCard: { name: 'UserHoverCard', template: '<div><slot/></div>' },
        },
      },
    });

    const hoverCards = wrapper.findAllComponents({ name: 'UserHoverCard' });
    expect(hoverCards.length).toBeGreaterThan(1); // there are two UserHoverCard instances

    // Emit follow from first hover card
    await (hoverCards[0]?.vm as any).$emit('follow');
    expect(wrapper.emitted('follow')?.length).toBe(1);

    // Emit follow from second hover card (username + avatar card)
    await (hoverCards[1]?.vm as any).$emit('follow');
    expect(wrapper.emitted('follow')?.length).toBe(2);

    // Emit unfollow from first hover card
    await (hoverCards[0]?.vm as any).$emit('unfollow');
    expect(wrapper.emitted('unfollow')?.length).toBe(1);

    // Emit unfollow from second hover card
    await (hoverCards[1]?.vm as any).$emit('unfollow');
    expect(wrapper.emitted('unfollow')?.length).toBe(2);

    // Emit unblock from first hover card (only first registers @unblock)
    await (hoverCards[0]?.vm as any).$emit('unblock');
    expect(wrapper.emitted('unblock')?.length).toBe(1);
  });
});
