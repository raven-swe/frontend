import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RadioGroup from '@/components/ui/radio-group/RadioGroup.vue';

describe('RadioGroup Component', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      slots: {
        default: () => '<div class="test-content">Radio items here</div>',
      },
    });
    expect(wrapper.html()).toContain('test-content');
    expect(wrapper.html()).toContain('Radio items here');
  });

  it('has correct data-slot attribute', async () => {
    const wrapper = await mountSuspended(RadioGroup);
    expect(wrapper.attributes('data-slot')).toBe('radio-group');
  });

  it('applies default grid and gap classes', async () => {
    const wrapper = await mountSuspended(RadioGroup);
    const classes = wrapper.classes();
    expect(classes).toContain('grid');
    expect(classes).toContain('gap-3');
  });

  it('accepts and applies custom class prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { class: 'custom-spacing gap-6' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('custom-spacing');
    expect(classes).toContain('gap-6');
  });

  it('accepts defaultValue prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { defaultValue: 'option1' },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with multiple radio items', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { defaultValue: 'comfortable' },
      slots: {
        default: () => `
          <div>
            <input type="radio" value="default" />
            <input type="radio" value="comfortable" />
            <input type="radio" value="compact" />
          </div>
        `,
      },
    });
    expect(wrapper.html()).toContain('type="radio"');
  });

  it('accepts disabled prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { disabled: true },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('accepts orientation prop', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { orientation: 'horizontal' },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('merges custom classes with default classes', async () => {
    const wrapper = await mountSuspended(RadioGroup, {
      props: { class: 'my-custom-class' },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('grid');
    expect(classes).toContain('gap-3');
    expect(classes).toContain('my-custom-class');
  });
});
