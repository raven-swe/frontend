import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileDetails from '@/components/profile/ProfileDetails.vue';

describe('ProfileDetails Component', () => {
  it('renders the main container with correct classes', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const container = wrapper.find('.mt-2.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders user name', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const userName = wrapper.find('h2');
    expect(userName.exists()).toBe(true);
    expect(userName.text()).toBe('Hussein Mohamed');
  });

  it('applies correct styling to user name', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const userName = wrapper.find('h2');
    const classes = userName.classes();
    expect(classes).toContain('text-foreground');
    expect(classes).toContain('text-2xl');
    expect(classes).toContain('font-bold');
  });

  it('renders username handle', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('@hussein');
  });

  it('renders user bio', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('football lover, software engineer, coffee addict.');
  });

  it('renders join date with translated text', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('july 2020');
    expect(html).toContain('Joined');
  });

  it('renders calendar icon for join date', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('ic:sharp-calendar-month');
  });

  it('renders following count', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('150');
    expect(html).toContain('Following');
  });

  it('renders followers count', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const html = wrapper.html();
    expect(html).toContain('50');
    expect(html).toContain('Followers');
  });

  it('has correct structure for statistics', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const statsContainer = wrapper.find('.mt-4.flex.space-x-4');
    expect(statsContainer.exists()).toBe(true);
  });

  it('applies muted foreground color to secondary text', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const mutedElements = wrapper.findAll('.text-muted-foreground');
    expect(mutedElements.length).toBeGreaterThan(0);
  });

  it('applies correct spacing to statistics labels', async () => {
    const wrapper = await mountSuspended(ProfileDetails);

    const statsSpans = wrapper.findAll('.text-muted-foreground.ms-1');
    expect(statsSpans.length).toBe(2); // Following and Followers labels
  });
});
