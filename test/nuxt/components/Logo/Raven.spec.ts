import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Raven from '@/components/Logo/Raven.vue';

describe('Raven Logo Component', () => {
  it('renders the Raven logo images', async () => {
    const wrapper = await mountSuspended(Raven);

    // Check if wrapper div exists
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);

    // Check if both images exist
    const images = wrapper.findAll('img');
    expect(images).toHaveLength(2);
  });

  it('contains light and dark mode images', async () => {
    const wrapper = await mountSuspended(Raven);

    const images = wrapper.findAll('img');
    expect(images).toHaveLength(2);

    // Check light mode image
    expect(images[0]?.attributes('src')).toBe('https://cdn.raven.cmp27.space/light-raven.jpg');
    expect(images[0]?.classes()).toContain('dark:hidden');

    // Check dark mode image
    expect(images[1]?.attributes('src')).toBe('https://cdn.raven.cmp27.space/dark-raven.png');
    expect(images[1]?.classes()).toContain('dark:block');
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(Raven);

    const images = wrapper.findAll('img');

    // Both images should have full width and height
    images.forEach((img) => {
      expect(img.classes()).toContain('h-full');
      expect(img.classes()).toContain('w-full');
    });
  });
});
