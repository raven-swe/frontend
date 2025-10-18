// @vitest-environment nuxt
import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Dialog from '@/components/ui/dialog/Dialog.vue';
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue';
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';

describe('Dialog component', () => {
  it('renders trigger and content (opens on trigger click)', async () => {
    const wrapper = await mountSuspended({
      components: {
        Dialog,
        DialogTrigger,
        DialogContent,
        DialogFooter,
        DialogTitle,
        DialogHeader,
        DialogDescription,
      },
      template: `
				<Dialog>
					<DialogTrigger>
					open
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								dialog header
							</DialogTitle>
							<DialogDescription>
								description
							</DialogDescription>
						</DialogHeader>
						Hello
						<DialogFooter>
							footer
						</DialogFooter>
					</DialogContent>
				</Dialog>
			`,
    });

    // trigger should be in the DOM
    expect(wrapper.html()).toContain('open');
    expect(wrapper.html()).not.toContain('dialog header');

    // find the trigger element and click it
    const trigger = wrapper.get('[data-slot="dialog-trigger"]');
    await trigger.trigger('click');

    // after click, dialog content should be present (portal/teleport may render it elsewhere)
    // search document for the dialog content slot attribute
    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toBeTruthy();
    const header = content.querySelector('[data-slot="dialog-header"]');
    expect(header?.textContent).toContain('dialog header');

    expect(content.textContent).toContain('Hello');

    const footer = content.querySelector('[data-slot="dialog-footer"]');
    expect(footer?.textContent).toContain('footer');

    const title = content.querySelector('[data-slot="dialog-title"]');
    expect(title?.textContent).toContain('dialog header');

    const description = content.querySelector('[data-slot="dialog-description"]');
    expect(description?.textContent).toContain('description');

    const close = content.querySelector('[data-slot="dialog-close"]') as HTMLElement | null;
    expect(close?.textContent).toContain('Close');

    // close button is rendered in the teleported dialog content (document).
    await close.click();
    // wait for DOM update
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeFalsy();
  });
  it('renders custom close button', async () => {
    const wrapper = await mountSuspended({
      components: {
        Dialog,
        DialogTrigger,
        DialogContent,
        DialogClose,
      },
      template: `
				<Dialog>
					<DialogTrigger>
					open
					</DialogTrigger>
					<DialogContent>
						Hello
						<DialogClose>
							<button>
								close-button
							</button>
						</DialogClose>
					</DialogContent>
				</Dialog>
			`,
    });

    // trigger should be in the DOM
    expect(wrapper.html()).toContain('open');
    expect(wrapper.html()).not.toContain('Hello');

    // find the trigger element and click it
    const trigger = wrapper.get('[data-slot="dialog-trigger"]');
    await trigger.trigger('click');

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toBeTruthy();
    expect(content?.textContent).toContain('Hello');
    const close = content?.querySelector('[data-slot="dialog-close"] button') as HTMLElement | null;
    expect(close?.textContent).toContain('close-button');

    // close button is rendered in the teleported dialog content (document).
    await close?.click();
    // wait for DOM update
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeFalsy();
  });
});
