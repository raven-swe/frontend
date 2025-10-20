import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Raven from '@/components/Logo/Raven.vue';

describe('Raven Logo Component', () => {
  it('renders the Raven logo SVG', async () => {
    const wrapper = await mountSuspended(Raven);

    // Check if SVG element exists
    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);

    // Check SVG attributes
    expect(svg.attributes('viewBox')).toBe('0 0 24 24');
    expect(svg.attributes('fill')).toBe('currentColor');
  });

  it('contains the correct SVG path', async () => {
    const wrapper = await mountSuspended(Raven);

    // Check if path element exists
    const path = wrapper.find('path');
    expect(path.exists()).toBe(true);
    expect(path.attributes('d')).toBeDefined();
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(Raven);

    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('text-blue-400');
  });
});
