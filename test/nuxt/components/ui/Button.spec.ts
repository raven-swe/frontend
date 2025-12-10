import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Button from '@/components/ui/Button.vue';

describe('Button Component', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(Button, {
      slots: { default: () => 'Click Me' },
    });
    expect(wrapper.html()).toContain('Click Me');
  });

  it('always has rounded styling', async () => {
    const wrapper = await mountSuspended(Button, {
      slots: { default: () => 'Rounded' },
    });
    expect(wrapper.classes()).toContain('rounded-full');
  });

  it('applies correct classes for variant: default', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'default' },
      slots: { default: () => 'default' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('bg-foreground');
    expect(classes).toContain('text-background');
  });

  it('applies correct classes for variant: primary', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'primary' },
      slots: { default: () => 'primary' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('bg-primary');
    expect(classes).toContain('hover:bg-primary/90');
  });

  it('applies correct classes for variant: outline', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'outline' },
      slots: { default: () => 'outline' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('border-input');
    expect(classes).toContain('bg-background');
    expect(classes).toContain('text-foreground');
  });

  it('applies correct classes for variant: outline-destructive-hover', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'outline-destructive-hover' },
      slots: { default: () => 'outline-destructive-hover' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('border-input');
    expect(classes).toContain('bg-background');
    expect(classes).toContain('hover:border-destructive');
    expect(classes).toContain('text-foreground');
  });

  it('applies correct classes for variant: ghost-default', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'ghost-default' },
      slots: { default: () => 'ghost-default' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('bg-background');
    expect(classes).toContain('hover:bg-foreground/10');
  });

  it('applies correct classes for variant: ghost-primary', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { variant: 'ghost-primary' },
      slots: { default: () => 'ghost-primary' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('text-primary');
    expect(classes).toContain('hover:bg-primary/10');
  });

  it('applies correct classes for size: xs', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'xs' },
      slots: { default: () => 'xs' },
    });
    expect(wrapper.classes()).toContain('h-8');
  });

  it('applies correct classes for size: sm', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'sm' },
      slots: { default: () => 'sm' },
    });
    expect(wrapper.classes()).toContain('h-8.5');
  });

  it('applies correct classes for size: md', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'md' },
      slots: { default: () => 'md' },
    });
    expect(wrapper.classes()).toContain('h-9');
  });

  it('applies correct classes for size: lg', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'lg' },
      slots: { default: () => 'lg' },
    });
    expect(wrapper.classes()).toContain('h-10');
  });

  it('applies correct classes for size: xl', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'xl' },
      slots: { default: () => 'xl' },
    });
    expect(wrapper.classes()).toContain('h-13');
  });

  it('applies correct classes for size: 2xl', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: '2xl' },
      slots: { default: () => '2xl' },
    });
    expect(wrapper.classes()).toContain('h-16.25');
  });

  it('applies correct classes for size: icon-xs', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-xs' },
      slots: { default: () => 'icon-xs' },
    });
    expect(wrapper.classes()).toContain('size-8');
  });

  it('applies correct classes for size: icon-sm', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-sm' },
      slots: { default: () => 'icon-sm' },
    });
    expect(wrapper.classes()).toContain('size-8.5');
  });

  it('applies correct classes for size: icon-md', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-md' },
      slots: { default: () => 'icon-md' },
    });
    expect(wrapper.classes()).toContain('size-9');
  });

  it('applies correct classes for size: icon-lg', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-lg' },
      slots: { default: () => 'icon-lg' },
    });
    expect(wrapper.classes()).toContain('size-10');
  });

  it('applies correct classes for size: icon-xl', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-xl' },
      slots: { default: () => 'icon-xl' },
    });
    expect(wrapper.classes()).toContain('size-13');
  });

  it('applies correct classes for size: icon-2xl', async () => {
    const wrapper = await mountSuspended(Button, {
      props: { size: 'icon-2xl' },
      slots: { default: () => 'icon-2xl' },
    });
    expect(wrapper.classes()).toContain('size-16.25');
  });
});
