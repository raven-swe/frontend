<script lang="ts" setup>
import { apiFetch } from '~/api';

const props = defineProps<{
  conversationId: string;
  messageId: string;
}>();

const emit = defineEmits<{
  (e: 'deleted'): void;
}>();

const isDeleting = ref(false);

const handleDelete = async () => {
  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await apiFetch<ApiSuccessResponse<{ success: boolean; message: string }>>(
      `/api/conversations/${props.conversationId}/messages/${props.messageId}`,
      {
        method: 'DELETE',
      },
    );
    emit('deleted');
  } catch (error) {
    console.error('Failed to delete message:', error);
    showToaster('error', 'Failed to delete message');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost-default"
        size="icon-sm"
        class="opacity-0 transition-opacity group-hover:opacity-100"
        data-test="dm-message-actions-trigger"
      >
        <Icon name="lucide:more-horizontal" size="18" />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="bg-background">
      <UiDropdownMenuItem
        data-test="delete-message-button"
        class="text-destructive focus:text-destructive"
        :disabled="isDeleting"
        @click="handleDelete"
      >
        <Icon name="lucide:trash-2" size="18" />
        {{ $t('dm.delete') }}
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
