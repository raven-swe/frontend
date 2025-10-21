import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileInfo from '@/components/profile/ProfileInfo.vue';

describe('ProfileInfo', () => {
  it('renders component with correct structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const container = wrapper.find('div.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders user name in h2 element', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const userName = wrapper.find('h2');
    expect(userName.exists()).toBe(true);
    expect(userName.classes()).toContain('text-2xl');
    expect(userName.classes()).toContain('font-bold');
  });

  it('renders user bio paragraph', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const paragraphs = wrapper.findAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders calendar icon for join date', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const html = wrapper.html();
    // Check if icon is rendered in the HTML
    expect(html).toContain('ic:sharp-calendar-month');
  });

  it('renders statistics section with proper structure', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const statsSection = wrapper.find('div.mt-4.flex.space-x-4');
    expect(statsSection.exists()).toBe(true);

    const statItems = statsSection.findAll('span');
    expect(statItems.length).toBeGreaterThanOrEqual(2);
  });

  it('renders following and followers counts with strong tags', async () => {
    const wrapper = await mountSuspended(ProfileInfo);

    const strongTags = wrapper.findAll('strong');
    expect(strongTags.length).toBe(2);
  });
});
