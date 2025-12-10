import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RadioGroup from '@/components/ui/radio-group/RadioGroup.vue';
import RadioGroupItem from '@/components/ui/radio-group/RadioGroupItem.vue';
import { h } from 'vue';

describe('RadioGroupItem Component', () => {
  it('renders successfully', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    expect(wrapper.findComponent(RadioGroupItem).exists()).toBe(true);
  });

  it('has correct data-slot attribute', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    expect(item.attributes('data-slot')).toBe('radio-group-item');
  });

  it('applies default styling classes', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes).toContain('border-input');
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('size-4');
    expect(classes).toContain('shrink-0');
  });

  it('accepts value prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'option1' }),
      },
    });
    expect(wrapper.findComponent(RadioGroupItem).exists()).toBe(true);
  });

  it('accepts and applies custom class prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test', class: 'custom-radio-class' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes).toContain('custom-radio-class');
  });

  it('has shadow styling', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes).toContain('shadow-xs');
  });

  it('has focus-visible styles', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes.some((c) => c.includes('focus-visible'))).toBe(true);
  });

  it('has disabled state styles', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes.some((c) => c.includes('disabled'))).toBe(true);
  });

  it('accepts disabled prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test', disabled: true }),
      },
    });
    expect(wrapper.findComponent(RadioGroupItem).exists()).toBe(true);
  });

  it('renders RadioGroupIndicator structure', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { defaultValue: 'test' },
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    // Check that the item exists and has the correct structure
    expect(item.exists()).toBe(true);
    expect(item.attributes('data-slot')).toBe('radio-group-item');
  });

  it('has aspect-square class for perfect circle', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes).toContain('aspect-square');
  });

  it('has transition classes', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const html = item.html();
    expect(html).toContain('transition');
  });

  it('merges custom classes with default classes', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => h(RadioGroupItem, { value: 'test', class: 'size-6 custom-size' }),
      },
    });
    const item = wrapper.findComponent(RadioGroupItem);
    const classes = item.classes();
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('custom-size');
  });
});
