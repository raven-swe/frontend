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

  it('applies correct classes for each variant', async () => {
    const variants: { name: string; expect: string[] }[] = [
      { name: 'default', expect: ['bg-foreground', 'text-background'] },
      { name: 'primary', expect: ['bg-primary', 'text-background'] },
      { name: 'outline', expect: ['text-foreground', 'bg-background'] },
      { name: 'outline-destructive', expect: ['bg-background', 'text-foreground'] },
      { name: 'ghost-default', expect: ['bg-background'] },
      { name: 'ghost-primary', expect: ['text-primary'] },
    ];

    for (const v of variants) {
      const wrapper = await mountSuspended(Button, {
        props: { variant: v.name },
        slots: { default: () => v.name },
      });
      const classes = wrapper.classes();
      for (const token of v.expect) expect(classes).toContain(token);
    }
  });

  it('applies correct classes for each size', async () => {
    const sizes: { name: string; expectedToken: string }[] = [
      { name: 'xs', expectedToken: 'h-8' },
      { name: 'sm', expectedToken: 'h-8.5' },
      { name: 'md', expectedToken: 'h-9' },
      { name: 'lg', expectedToken: 'h-10' },
      { name: 'xl', expectedToken: 'h-13' },
      { name: '2xl', expectedToken: 'h-16.25' },
      { name: 'icon-xs', expectedToken: 'size-8' },
      { name: 'icon-sm', expectedToken: 'size-8.5' },
      { name: 'icon-md', expectedToken: 'size-9' },
      { name: 'icon-lg', expectedToken: 'size-10' },
      { name: 'icon-xl', expectedToken: 'size-13' },
      { name: 'icon-2xl', expectedToken: 'size-16.25' },
    ];

    for (const s of sizes) {
      const wrapper = await mountSuspended(Button, {
        props: { size: s.name },
        slots: { default: () => s.name },
      });
      const classes = wrapper.classes();
      expect(classes).toContain(s.expectedToken);
    }
  });
});
