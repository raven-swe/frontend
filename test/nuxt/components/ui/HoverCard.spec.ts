// hovercard.spec.ts

import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import { HoverCardRoot, HoverCardTrigger, HoverCardContent } from '@/components/ui/HoverCard';

// The delay set in the component's props
const OPEN_CLOSE_DELAY = 50;

describe('HoverCard component', () => {
  // Use fake timers for this test block
  vi.useFakeTimers();

  it('opens on trigger hover and closes on mouse leave', async () => {
    const wrapper = await mountSuspended({
      components: {
        HoverCardRoot,
        HoverCardTrigger,
        HoverCardContent,
      },
      template: `
        <HoverCardRoot :open-delay="${OPEN_CLOSE_DELAY}" :close-delay="${OPEN_CLOSE_DELAY}">
          <HoverCardTrigger>
            <span data-test="hover-trigger">Hover Me to See Content</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <p data-test="hover-content-text">This content is visible on hover.</p>
          </HoverCardContent>
        </HoverCardRoot>
      `,
    });

    const triggerSelector = '[data-slot="hover-card-trigger"]';
    const contentSelector = '[data-slot="hover-card-content"]';

    // 1. Initial State Check: Content should be absent
    expect(document.querySelector(contentSelector)).toBeFalsy();

    // 2. Simulate Hover: Trigger mouseover
    const trigger = wrapper.get(triggerSelector);
    await trigger.trigger('mouseover');

    // Ensure the event handlers have completed their synchronous work
    await nextTick();

    // 🔑 FIX: Advance time PAST the required delay
    vi.advanceTimersByTime(OPEN_CLOSE_DELAY + 1);

    // 🔑 FIX: Run ALL pending microtasks and timers, then flush Vue's render queue
    // This is the most aggressive and reliable way to ensure the portal renders.
    await vi.runAllTimersAsync();
    await nextTick();

    // 3. Open State Check: Content should now be present in the document
    let content = document.querySelector(contentSelector);
    // This assertion must now pass.
    expect(content).toBeTruthy();
    expect(content?.textContent).toContain('This content is visible on hover.');

    // 4. Simulate Mouse Leave: Trigger the mouseout event
    await trigger.trigger('mouseout');

    // Ensure the event handlers have completed their synchronous work
    await nextTick();

    // 🔑 FIX: Advance time PAST the required close delay
    vi.advanceTimersByTime(OPEN_CLOSE_DELAY + 1);

    // 🔑 FIX: Run ALL pending microtasks/timers and flush Vue's render queue
    await vi.runAllTimersAsync();
    await nextTick();

    // 5. Closed State Check: Content should be absent from the document
    content = document.querySelector(contentSelector);
    expect(content).toBeFalsy();
  });
});
