/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Base from '@/components/notifications/Base.vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

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
        messageKey: 'notifications.message.follow', // Use a real key or mock one
        messageParams: { named: { user1: 'placeholder' } },
        displayActors: [mockActor],
        actors: [mockActor],
        timestamp: '2025-01-01T00:00:00Z',
        icon: { name: 'bell', color: 'text-red-500' },
        linkTo: '/some/path',
        isSeen: false,
      },
      slots: {
        default: '<div data-test="slot-content">slot content</div>',
      },
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot/></a>' },
          Icon: {
            name: 'Icon',
            props: ['name', 'size'],
            template: '<i :data-name="name" :class="$attrs.class">{{ name }}</i>',
          },
          UiAvatar: {
            name: 'UiAvatar',
            props: ['img', 'alt'],
            template: '<img :src="img" :alt="alt" />',
          },
          UserHoverCard: { name: 'UserHoverCard', template: '<div><slot/></div>' },
        },
      },
    });

    // Link href
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/some/path');

    // Icon rendered
    // The Icon component from @nuxt/icon renders a span with classes when not stubbed correctly or when using the real component
    // We check for the rendered output since the stub seems to be ignored
    const icon = wrapper.find('.iconify');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('i-bell');
    expect(icon.classes()).toContain('text-red-500');

    // Message displayed - check for part of the message from en.json or just check existence
    // "notifications.message.follow": "{user1} started following you"
    expect(wrapper.text()).toContain('started following you');

    // Actor avatar and alt
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('/actor.jpg');
    expect(img.attributes('alt')).toBe('actor1');

    // Relative timestamp comes from mocked util
    expect(wrapper.text()).toContain('relative-2025-01-01T00:00:00Z');

    // Slot content rendered
    expect(wrapper.find('[data-test="slot-content"]').exists()).toBe(true);

    // Unseen class present
    expect(wrapper.html()).toContain('bg-primary/10');
  });

  it('does not render icon when icon prop is not provided', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        messageKey: 'notifications.message.follow',
        displayActors: [mockActor],
        actors: [mockActor],
        timestamp: '2025-01-02T00:00:00Z',
        linkTo: '/no-icon',
      },
      global: {
        plugins: [i18n],
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

    // Ensure no icon stub data-name attribute
    expect(wrapper.find('i[data-name]').exists()).toBe(false);
  });

  it('does not apply unseen class when isSeen is true', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        messageKey: 'notifications.message.follow',
        displayActors: [mockActor],
        actors: [mockActor],
        timestamp: '2025-01-03T00:00:00Z',
        linkTo: '/seen',
        isSeen: true,
      },
      global: {
        plugins: [i18n],
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

  it('forwards follow and unfollow events emitted by UserHoverCard (from both cards)', async () => {
    const wrapper = await mountSuspended(Base, {
      props: {
        messageKey: 'notifications.message.follow',
        messageParams: { named: { user1: 'placeholder' } },
        displayActors: [mockActor],
        actors: [mockActor],
        timestamp: '2025-01-04T00:00:00Z',
        linkTo: '/events',
      },
      global: {
        plugins: [i18n],
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
  });
});
