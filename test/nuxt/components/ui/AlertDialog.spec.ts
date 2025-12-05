import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import AlertDialogTrigger from '~/components/ui/alert-dialog/AlertDialogTrigger.vue';
import AlertDialogContent from '~/components/ui/alert-dialog/AlertDialogContent.vue';
import AlertDialogDescription from '~/components/ui/alert-dialog/AlertDialogDescription.vue';
import AlertDialogTitle from '~/components/ui/alert-dialog/AlertDialogTitle.vue';
import AlertDialogHeader from '~/components/ui/alert-dialog/AlertDialogHeader.vue';
import AlertDialogFooter from '~/components/ui/alert-dialog/AlertDialogFooter.vue';
import AlertDialogAction from '~/components/ui/alert-dialog/AlertDialogAction.vue';
import AlertDialogCancel from '~/components/ui/alert-dialog/AlertDialogCancel.vue';
import { nextTick } from 'vue';

describe('AlertDialog Components', () => {
  it('renders Buttons Correctly', async () => {
    const wrapper = await mountSuspended({
      components: {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogTrigger,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogDescription,
        AlertDialogFooter,
      },
      template: `
			<AlertDialog :open='true'>
				<AlertDialogTrigger data-test='trigger-btn'>Open Dialog</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle data-test="title">Delete Item</AlertDialogTitle>
						<AlertDialogDescription data-test="description">Are you sure you want to delete this item? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction data-test='action-btn' variant="destructive" size="md">Delete</AlertDialogAction>
						<AlertDialogCancel data-test='cancel-btn'>Cancel</AlertDialogCancel>
					</AlertDialogFooter>				
				</AlertDialogContent>
			</AlertDialog>
			`,
      props: {
        variant: 'destructive',
        size: 'md',
      },
      slots: {
        default: 'Delete',
      },
    });
    const triggerBtn = wrapper.find("[data-test='trigger-btn']");
    expect(triggerBtn.exists()).toBe(true);
    await triggerBtn.trigger('click');
    await nextTick();
    const dialogContent = document.querySelector('[data-slot="alert-dialog-content"]');
    expect(dialogContent).toBeTruthy();
    const actionBtn = dialogContent?.querySelector("[data-test='action-btn']");
    const cancelBtn = dialogContent?.querySelector("[data-test='cancel-btn']");
    expect(actionBtn).toBeTruthy();
    expect(cancelBtn).toBeTruthy();

    const title = dialogContent?.querySelector("[data-test='title']");
    const description = dialogContent?.querySelector("[data-test='description']");
    expect(title?.textContent).toBe('Delete Item');
    expect(description?.textContent).toBe(
      'Are you sure you want to delete this item? This action cannot be undone.',
    );
  });
});
