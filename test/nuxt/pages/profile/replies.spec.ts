import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RepliePage from '~/pages/profile/replies.vue';

describe('RepliePage', () => {
  const createWrapper = () => {
    return mount(RepliePage);
  };

  it('renders the page', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders all posts user replied to', () => {
    const wrapper = createWrapper();
    const posts = wrapper.findAll('p');
    expect(posts).toHaveLength(3);
  });
});
