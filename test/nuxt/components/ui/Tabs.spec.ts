import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import { h } from 'vue';

describe('Tabs Component', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(Tabs, {
      slots: {
        default: () => h('div', { 'data-testid': 'child-element' }, 'Child Content'),
      },
    });
    expect(wrapper.find('[data-testid="child-element"]').exists()).toBe(true);
    expect(wrapper.html()).toContain('Child Content');
  });

  it('applies the correct base classes', async () => {
    const wrapper = await mountSuspended(Tabs);
    const classes = wrapper.classes();
    expect(classes).toContain('tabs');
    expect(classes).toContain('border-b');
    expect(classes).toContain('flex');
    expect(classes).toContain('w-full');
  });
});

describe('Tab Component', () => {
  it('renders the label correctly', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: { label: 'My Tab', route: '/' },
    });
    expect(wrapper.text()).toContain('My Tab');
  });

  it('renders a NuxtLink with the correct route', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: { label: 'My Tab', route: '/' },
    });
    const link = wrapper.findComponent({ name: 'NuxtLink' });
    expect(link.exists()).toBe(true);
    expect(link.props('to')).toBe('/');
  });

  it('applies inactive styles by default', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: { label: 'Inactive Tab', route: '/' },
    });
    expect(wrapper.classes()).toContain('text-muted-foreground');
    expect(wrapper.classes()).toContain('font-medium');
    expect(wrapper.classes()).not.toContain('text-foreground');
    expect(wrapper.classes()).not.toContain('font-bold');
    expect(wrapper.find('.bg-primary').exists()).toBe(false);
  });

  it('applies active styles when isActive is true', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: { label: 'Active Tab', route: '/', isActive: true },
    });
    expect(wrapper.classes()).toContain('text-foreground');
    expect(wrapper.classes()).toContain('font-bold');
    expect(wrapper.classes()).not.toContain('text-muted-foreground');
    expect(wrapper.classes()).not.toContain('font-medium');
    expect(wrapper.find('.bg-primary').exists()).toBe(true);
  });

  it('renders multiple tabs inside a Tabs container', async () => {
    const wrapper = await mountSuspended(Tabs, {
      slots: {
        default: () => [
          h(Tab, { label: 'Tab 1', route: '/' }),
          h(Tab, { label: 'Tab 2', route: '/' }),
        ],
      },
    });
    expect(wrapper.findAllComponents(Tab).length).toBe(2);
  });
});
