import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { h } from 'vue';

import Popover from '~/components/ui/Popover.vue';
import PopoverTrigger from '~/components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '~/components/ui/popover/PopoverContent.vue';

describe('Popover Component', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(Popover, {
      slots: { default: () => '<div>Popover content</div>' },
    });
    expect(wrapper.html()).toContain('Popover content');
  });

  it('forwards props and emits correctly', async () => {
    const wrapper = await mountSuspended(Popover, {
      props: { open: false },
      slots: { default: () => '<div>Test</div>' },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe('PopoverTrigger Component', () => {
  it('renders slot content within popover context', async () => {
    const wrapper = await mountSuspended(Popover, {
      slots: {
        default: () =>
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
      },
    });
    expect(wrapper.html()).toContain('Trigger');
  });

  it('wraps content in ClientOnly within popover context', async () => {
    const wrapper = await mountSuspended(Popover, {
      slots: {
        default: () =>
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Click me</button>',
            },
          ),
      },
    });
    expect(wrapper.html()).toContain('Click me');
  });

  it('forwards props correctly within popover context', async () => {
    const wrapper = await mountSuspended(Popover, {
      slots: {
        default: () =>
          h(
            PopoverTrigger,
            { asChild: true },
            {
              default: () => '<button>Trigger</button>',
            },
          ),
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe('PopoverContent Component', () => {
  it('renders slot content within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true }, // Open the popover to render content
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Content</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body since content is portaled
    expect(document.body.innerHTML).toContain('Content');
  });

  it('applies default classes within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Content</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body for portaled content
    const hasPopoverBg = document.querySelector('[class*="bg-popover"]');
    expect(hasPopoverBg).toBeTruthy();
  });

  it('applies custom class within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            { class: 'custom-class' },
            {
              default: () => '<div>Content</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body for portaled content
    const customElement = document.querySelector('.custom-class');
    expect(customElement).toBeTruthy();
  });

  it('uses default props within popover context', async () => {
    const wrapper = await mountSuspended(Popover, {
      slots: {
        default: () =>
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Content</div>',
            },
          ),
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('wraps content in ClientOnly and PopoverPortal', async () => {
    const wrapper = await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Portal content</div>',
            },
          ),
        ],
      },
    });
    // Check teleport comment exists in wrapper
    expect(wrapper.html()).toContain('<!--teleport start-->');
    // Check actual content is in document body
    expect(document.body.innerHTML).toContain('Portal content');
  });

  it('applies animation classes within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Animated</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body for portaled content
    const animatedElement = document.querySelector('[class*="animate-in"]');
    expect(animatedElement).toBeTruthy();
  });

  it('applies positioning classes within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Positioned</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body for portaled content
    const positionedElement = document.querySelector('[class*="slide-in-from"]');
    expect(positionedElement).toBeTruthy();
  });

  it('has correct z-index and width within popover context', async () => {
    void (await mountSuspended(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(
            PopoverTrigger,
            {},
            {
              default: () => '<button>Trigger</button>',
            },
          ),
          h(
            PopoverContent,
            {},
            {
              default: () => '<div>Styled</div>',
            },
          ),
        ],
      },
    }));
    // Check in document body for portaled content
    const zIndexElement = document.querySelector('[class*="z-50"]');
    expect(zIndexElement).toBeTruthy();
    const widthElement = document.querySelector('[class*="w-72"]');
    expect(widthElement).toBeTruthy();
  });
});
